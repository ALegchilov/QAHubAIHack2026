#!/usr/bin/env python3
"""
InvenTree API Schema Reader — efficient OpenAPI spec querying tool.

Downloads the InvenTree OpenAPI spec once (caches locally), then provides
targeted queries so agents can extract only the endpoint/schema details
they need without loading 41K lines of YAML into context.

Usage:
    python3 schema_reader.py list-paths [--filter PATTERN]
    python3 schema_reader.py endpoint PATH [--method METHOD]
    python3 schema_reader.py schema SCHEMA_NAME
    python3 schema_reader.py endpoint-full PATH [--method METHOD]
    python3 schema_reader.py search KEYWORD
    python3 schema_reader.py summary PATH [--method METHOD]

Examples:
    python3 schema_reader.py list-paths --filter /api/part/
    python3 schema_reader.py endpoint /api/part/ --method post
    python3 schema_reader.py schema Part
    python3 schema_reader.py endpoint-full /api/part/{id}/ --method patch
    python3 schema_reader.py search category
    python3 schema_reader.py summary /api/part/
"""

import argparse
import json
import os
import sys
import urllib.request
import yaml

SPEC_URL = "https://raw.githubusercontent.com/inventree/schema/main/export/477/api.yaml"
CACHE_PATH = "/tmp/inventree-api-477.yaml"
CACHE_PARSED_PATH = "/tmp/inventree-api-477.json"


def load_spec():
    """Load the OpenAPI spec, downloading and caching if needed."""
    # Try parsed JSON cache first (faster to load)
    if os.path.exists(CACHE_PARSED_PATH):
        with open(CACHE_PARSED_PATH) as f:
            return json.load(f)

    # Try YAML cache
    if not os.path.exists(CACHE_PATH):
        print(f"Downloading OpenAPI spec from {SPEC_URL}...", file=sys.stderr)
        urllib.request.urlretrieve(SPEC_URL, CACHE_PATH)
        print("Done.", file=sys.stderr)

    with open(CACHE_PATH) as f:
        spec = yaml.safe_load(f)

    # Cache as JSON for faster subsequent loads
    with open(CACHE_PARSED_PATH, "w") as f:
        json.dump(spec, f)

    return spec


def resolve_ref(spec, ref):
    """Resolve a $ref pointer like '#/components/schemas/Part'."""
    if not ref or not ref.startswith("#/"):
        return None
    parts = ref.lstrip("#/").split("/")
    node = spec
    for part in parts:
        if isinstance(node, dict) and part in node:
            node = node[part]
        else:
            return None
    return node


def resolve_schema_deep(spec, schema, depth=0, max_depth=2):
    """Resolve a schema, inlining $ref references up to max_depth levels."""
    if depth > max_depth:
        if "$ref" in schema:
            return {"$ref": schema["$ref"], "_note": "max depth reached"}
        return schema

    if "$ref" in schema:
        ref_name = schema["$ref"].split("/")[-1]
        resolved = resolve_ref(spec, schema["$ref"])
        if resolved is None:
            return {"$ref": schema["$ref"], "_note": "unresolved"}
        result = resolve_schema_deep(spec, resolved, depth + 1, max_depth)
        result["_schema_name"] = ref_name
        return result

    result = {}
    for key, value in schema.items():
        if key == "properties" and isinstance(value, dict):
            result[key] = {}
            for prop_name, prop_schema in value.items():
                result[key][prop_name] = resolve_schema_deep(
                    spec, prop_schema, depth + 1, max_depth
                )
        elif key == "items" and isinstance(value, dict):
            result[key] = resolve_schema_deep(spec, value, depth + 1, max_depth)
        elif key in ("allOf", "oneOf", "anyOf") and isinstance(value, list):
            result[key] = [
                resolve_schema_deep(spec, item, depth + 1, max_depth)
                for item in value
            ]
        else:
            result[key] = value

    return result


def get_request_body_schema(spec, operation):
    """Extract the JSON request body schema from an operation."""
    rb = operation.get("requestBody", {})
    content = rb.get("content", {})
    json_content = content.get("application/json", {})
    schema = json_content.get("schema", {})
    if schema:
        return resolve_schema_deep(spec, schema)
    return None


def get_response_schemas(spec, operation):
    """Extract response schemas for all status codes."""
    responses = operation.get("responses", {})
    result = {}
    for status, resp in responses.items():
        content = resp.get("content", {})
        json_content = content.get("application/json", {})
        schema = json_content.get("schema", {})
        desc = resp.get("description", "")
        if schema:
            result[status] = {
                "description": desc,
                "schema": resolve_schema_deep(spec, schema),
            }
        else:
            result[status] = {"description": desc}
    return result


def get_parameters(spec, operation, path_params=None):
    """Extract all parameters (query, path, header) from an operation."""
    params = list(path_params or []) + list(operation.get("parameters", []))
    result = []
    for p in params:
        if "$ref" in p:
            p = resolve_ref(spec, p["$ref"]) or p
        entry = {
            "name": p.get("name"),
            "in": p.get("in"),
            "required": p.get("required", False),
            "description": p.get("description", ""),
        }
        schema = p.get("schema", {})
        if schema:
            entry["type"] = schema.get("type", "")
            if "enum" in schema:
                entry["enum"] = schema["enum"]
            if "format" in schema:
                entry["format"] = schema["format"]
        result.append(entry)
    return result


def cmd_list_paths(spec, args):
    """List all API paths, optionally filtered."""
    paths = spec.get("paths", {})
    for path in sorted(paths.keys()):
        if args.filter and args.filter not in path:
            continue
        methods = [m.upper() for m in paths[path].keys() if m in (
            "get", "post", "put", "patch", "delete", "head", "options"
        )]
        tags = set()
        for m in paths[path].values():
            if isinstance(m, dict):
                tags.update(m.get("tags", []))
        tag_str = f"  [{', '.join(sorted(tags))}]" if tags else ""
        print(f"{path}: {', '.join(methods)}{tag_str}")


def cmd_endpoint(spec, args):
    """Show details for a specific endpoint path and optional method."""
    paths = spec.get("paths", {})
    path_data = paths.get(args.path)
    if not path_data:
        # Try with/without trailing slash
        alt = args.path.rstrip("/") + "/" if not args.path.endswith("/") else args.path.rstrip("/")
        path_data = paths.get(alt)
        if not path_data:
            print(f"Path not found: {args.path}", file=sys.stderr)
            sys.exit(1)

    path_params = path_data.get("parameters", [])
    methods_to_show = [args.method.lower()] if args.method else [
        m for m in path_data.keys() if m in ("get", "post", "put", "patch", "delete")
    ]

    for method in methods_to_show:
        op = path_data.get(method)
        if not op:
            continue

        output = {
            "path": args.path,
            "method": method.upper(),
            "operationId": op.get("operationId", ""),
            "description": op.get("description", ""),
            "tags": op.get("tags", []),
            "parameters": get_parameters(spec, op, path_params),
            "requestBody": get_request_body_schema(spec, op),
            "responses": get_response_schemas(spec, op),
        }
        print(json.dumps(output, indent=2))
        if len(methods_to_show) > 1:
            print("---")


def cmd_schema(spec, args):
    """Show a specific schema definition with resolved references."""
    schemas = spec.get("components", {}).get("schemas", {})
    schema = schemas.get(args.name)
    if not schema:
        # Try case-insensitive search
        for name, s in schemas.items():
            if name.lower() == args.name.lower():
                schema = s
                args.name = name
                break
    if not schema:
        print(f"Schema not found: {args.name}", file=sys.stderr)
        # Show similar names
        matches = [n for n in schemas if args.name.lower() in n.lower()]
        if matches:
            print(f"Similar schemas: {', '.join(sorted(matches))}", file=sys.stderr)
        sys.exit(1)

    resolved = resolve_schema_deep(spec, schema, max_depth=2)
    resolved["_schema_name"] = args.name

    # Add field summary for quick reference
    props = resolved.get("properties", {})
    if props:
        required = set(resolved.get("required", []))
        summary = {}
        for name, prop in props.items():
            field_info = prop.get("type", prop.get("$ref", "object"))
            extras = []
            if name in required:
                extras.append("required")
            if prop.get("readOnly"):
                extras.append("readOnly")
            if prop.get("nullable"):
                extras.append("nullable")
            if prop.get("maxLength"):
                extras.append(f"maxLen={prop['maxLength']}")
            if prop.get("default") is not None:
                extras.append(f"default={prop['default']}")
            if extras:
                field_info += f" ({', '.join(extras)})"
            summary[name] = field_info
        resolved["_field_summary"] = summary

    print(json.dumps(resolved, indent=2))


def cmd_endpoint_full(spec, args):
    """Show endpoint with fully resolved request/response schemas."""
    # Same as endpoint but with deeper resolution
    paths = spec.get("paths", {})
    path_data = paths.get(args.path)
    if not path_data:
        alt = args.path.rstrip("/") + "/" if not args.path.endswith("/") else args.path.rstrip("/")
        path_data = paths.get(alt)
        if not path_data:
            print(f"Path not found: {args.path}", file=sys.stderr)
            sys.exit(1)

    path_params = path_data.get("parameters", [])
    method = args.method.lower() if args.method else list(
        m for m in path_data.keys() if m in ("get", "post", "put", "patch", "delete")
    )[0]

    op = path_data.get(method)
    if not op:
        print(f"Method {method} not found for {args.path}", file=sys.stderr)
        sys.exit(1)

    # Get request body with full resolution
    rb_schema = None
    rb = op.get("requestBody", {})
    content = rb.get("content", {})
    json_content = content.get("application/json", {})
    raw_schema = json_content.get("schema", {})
    if raw_schema:
        rb_schema = resolve_schema_deep(spec, raw_schema, max_depth=3)
        # Add field summary
        props = rb_schema.get("properties", {})
        if props:
            required = set(rb_schema.get("required", []))
            summary = {}
            for name, prop in props.items():
                field_info = prop.get("type", prop.get("$ref", "object"))
                extras = []
                if name in required:
                    extras.append("required")
                if prop.get("readOnly"):
                    extras.append("readOnly")
                if prop.get("nullable"):
                    extras.append("nullable")
                if prop.get("maxLength"):
                    extras.append(f"maxLen={prop['maxLength']}")
                if prop.get("minimum") is not None:
                    extras.append(f"min={prop['minimum']}")
                if prop.get("maximum") is not None:
                    extras.append(f"max={prop['maximum']}")
                if prop.get("default") is not None:
                    extras.append(f"default={prop['default']}")
                if prop.get("format"):
                    extras.append(f"format={prop['format']}")
                if extras:
                    field_info += f" ({', '.join(extras)})"
                summary[name] = field_info
            rb_schema["_field_summary"] = summary

    output = {
        "path": args.path,
        "method": method.upper(),
        "operationId": op.get("operationId", ""),
        "description": op.get("description", ""),
        "tags": op.get("tags", []),
        "parameters": get_parameters(spec, op, path_params),
        "requestBody": rb_schema,
        "responses": get_response_schemas(spec, op),
    }
    print(json.dumps(output, indent=2))


def cmd_search(spec, args):
    """Search paths and schemas for a keyword."""
    keyword = args.keyword.lower()
    paths = spec.get("paths", {})
    schemas = spec.get("components", {}).get("schemas", {})

    print("=== Matching Paths ===")
    for path in sorted(paths.keys()):
        if keyword in path.lower():
            methods = [m.upper() for m in paths[path].keys() if m in (
                "get", "post", "put", "patch", "delete"
            )]
            print(f"  {path}: {', '.join(methods)}")

    print("\n=== Matching Schemas ===")
    for name in sorted(schemas.keys()):
        if keyword in name.lower():
            props = schemas[name].get("properties", {})
            print(f"  {name} ({len(props)} properties)")

    print("\n=== Matching Operation Descriptions ===")
    for path, methods in paths.items():
        for method, op in methods.items():
            if not isinstance(op, dict):
                continue
            desc = op.get("description", "")
            op_id = op.get("operationId", "")
            if keyword in desc.lower() or keyword in op_id.lower():
                print(f"  {method.upper()} {path}: {desc[:100]}")


def cmd_summary(spec, args):
    """Show a compact summary of an endpoint — methods, params count, schema refs."""
    paths = spec.get("paths", {})
    path_data = paths.get(args.path)
    if not path_data:
        alt = args.path.rstrip("/") + "/" if not args.path.endswith("/") else args.path.rstrip("/")
        path_data = paths.get(alt)
        if not path_data:
            print(f"Path not found: {args.path}", file=sys.stderr)
            sys.exit(1)

    methods_to_show = [args.method.lower()] if args.method else [
        m for m in path_data.keys() if m in ("get", "post", "put", "patch", "delete")
    ]

    for method in methods_to_show:
        op = path_data.get(method)
        if not op:
            continue

        params = op.get("parameters", []) + path_data.get("parameters", [])
        query_params = [p.get("name", "") for p in params if isinstance(p, dict) and p.get("in") == "query"]

        rb = op.get("requestBody", {}).get("content", {}).get("application/json", {}).get("schema", {})
        rb_ref = rb.get("$ref", "inline" if rb else "none")

        responses = {code: resp.get("description", "") for code, resp in op.get("responses", {}).items()}

        print(f"{method.upper()} {args.path}")
        print(f"  operationId: {op.get('operationId', '')}")
        print(f"  description: {op.get('description', '')[:150]}")
        print(f"  tags: {op.get('tags', [])}")
        print(f"  query params ({len(query_params)}): {', '.join(query_params[:15])}{'...' if len(query_params) > 15 else ''}")
        print(f"  request body schema: {rb_ref}")
        print(f"  responses: {responses}")
        print()


def main():
    parser = argparse.ArgumentParser(description="InvenTree API Schema Reader")
    sub = parser.add_subparsers(dest="command", help="Command to run")

    # list-paths
    lp = sub.add_parser("list-paths", help="List API paths")
    lp.add_argument("--filter", "-f", default="", help="Filter paths containing this string")

    # endpoint
    ep = sub.add_parser("endpoint", help="Show endpoint details")
    ep.add_argument("path", help="API path (e.g., /api/part/)")
    ep.add_argument("--method", "-m", help="HTTP method (get, post, etc.)")

    # schema
    sc = sub.add_parser("schema", help="Show schema definition")
    sc.add_argument("name", help="Schema name (e.g., Part, PartCategory)")

    # endpoint-full
    ef = sub.add_parser("endpoint-full", help="Endpoint with fully resolved schemas")
    ef.add_argument("path", help="API path")
    ef.add_argument("--method", "-m", help="HTTP method")

    # search
    sr = sub.add_parser("search", help="Search paths and schemas by keyword")
    sr.add_argument("keyword", help="Keyword to search for")

    # summary
    sm = sub.add_parser("summary", help="Compact endpoint summary")
    sm.add_argument("path", help="API path")
    sm.add_argument("--method", "-m", help="HTTP method")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    spec = load_spec()

    commands = {
        "list-paths": cmd_list_paths,
        "endpoint": cmd_endpoint,
        "schema": cmd_schema,
        "endpoint-full": cmd_endpoint_full,
        "search": cmd_search,
        "summary": cmd_summary,
    }
    commands[args.command](spec, args)


if __name__ == "__main__":
    main()
