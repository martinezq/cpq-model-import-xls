# CPQ Product Modeling Excel tool

## Requirements

Node.js

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
