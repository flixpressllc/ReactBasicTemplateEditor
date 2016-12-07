# JSON file spec

* `templateId`: (`int`, required)
* `ui`: (`Array<Object>`, required) An array of objects which defines the ui based on the defined components
* `<component definitions>` (multiple nodes, see below)

## Component definitions

Component definitions start with a top-level node that is the camelCase, pluralized version of a given type of component. For example, to define a `TextField`, you might use the following:

```json
{
  "templateId": 1,
  "textFields": {
    "Main Text": {
      "value": ""
    }
  },
  "ui": []
}
```
TODO: finish this documentation.
