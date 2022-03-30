# CPQ Product Modeling Excel tool

## Requirements

Node.js (LTS)

https://nodejs.org/en/

## Instalation

1. Download content of this repository
2. Install Node.js
3. Open terminal (`cmd` on Windows)
4. Navigate to project's directory
5. Run command `npm install`

## Supported features

- Save all CPQ modules and variants to XLS file
- Replace all CPQ modules and variants from XLS file (identified by name)
- Only global features supported

## Commands

### Configuration management

```
Commands:
  main.js config list          List all configurations
  main.js config setup [name]  Setup configuration
  main.js config get [name]    Get configuration
  main.js config del [name]    Delete configuration
  main.js config clear         Clear all configurations
```

#### Configure connection to CPQ

`node src\main.js config setup test1`

It will setup connection `test1`, so it can later be used to interact with CPQ. Any number of conections can be stored in the tool.

```
Setting up connection "test1"
√ What is your Tacton CPQ Admin base url? ... https://project-admin.tactoncpq.com
√ What is Tacton CPQ Admin ticket name? ... T-00000157
√ What is Tacton CPQ Admin username? ... api_admin
√ What is Tacton CPQ Admin password? ... ************
√ Should I test the connection? ... off / on
  - Testing connection to https://asm-admin.tactoncpq.com as api_admin... OK
Configuration has been saved
```

### Read CPQ data to XLS

```
Commands:
  main.js read cpq-to-xls [conf] [file]  Reads model data from CPQ and saves it
                                         into Excel file`
```

Example:

`node src\main.js read cpq-to-xls test1 out\cpq_data.xlsx`

### Write XLS data to CPQ

```
Commands:
  main.js write xls-to-cpq [file] [conf]  Write from xlsx file to CPQ
```

Example:

`node src\main.js write xls-to-cpq out\cpq_data.xlsx test1`

after few seconds the tool will prompt for confirmation:

`? Import to CPQ ticket T-00000157 with content of out\cpq_data.xlsx? (188 modules with total 934 variants will be recreated) » (y/N)`
