# InvenTree Demo Instance

## Application URL

- **Web UI:** https://demo.inventree.org
- **Login page:** https://demo.inventree.org/web/login
- **API base:** https://demo.inventree.org/api/

## Login Accounts

| Username    | Password    | Description                                                                        |
|-------------|-------------|------------------------------------------------------------------------------------|
| allaccess   | nolimits    | View / create / edit all pages and items                                           |
| reader      | readonly    | Can view all pages but cannot create, edit or delete database records               |
| engineer    | partsonly   | Can manage parts, view stock, but no access to purchase orders or sales orders      |
| admin       | inventree   | Superuser account, access all areas plus administrator actions                      |

## Recommended Accounts by Use Case

- **UI test cases / automation:** `allaccess` (broad permissions without admin overhead)
- **Permission/negative testing:** `reader` or `engineer` (restricted access scenarios)
- **Admin workflows:** `admin` (superuser actions, settings, plugin management)

## Data Persistence

- The demo database **resets to a known state once per day**.
- Database records are reset to the latest state of the demo dataset.
- InvenTree software is kept up to date with the latest `inventree:master` available via Docker.
- During the update period, the demo server may be inaccessible for a few minutes.
