### JSON Merge Utilities

This repository contains three Node.js command-line utilities for merging data from one JSON file into another. Each script uses a different method for merging, which results in distinct behaviors, especially when handling arrays.

-----

### Prerequisites

To run these scripts, you need to have Node.js installed. Each utility also requires a specific library, which you can install via npm.

  * **`merge-json.js`**: No external dependencies.
  * **`deepmerge.js`**: Requires the `deepmerge` library.
    `npm install deepmerge`
  * **`lodash-merge.js`**: Requires the `lodash` library.
    `npm install lodash`

-----

### Usage

All three utilities are run from the command line with the same basic syntax.

`node <script_name.js> <source_file.json> <target_file.json>`

The result of the merge will be printed to standard output (stdout), so you can redirect it to a new file.

Example: `node deepmerge.js AllergyIntolerance-604a-pat-sf-partial-update.json AllergyIntolerance-604a-pat-sf.json > merged.json`

-----

### Merging Behavior and Key Differences

The core difference between the scripts lies in how they handle arrays and nested objects.

| Script Name | Merging Method | Array Behavior |
| :--- | :--- | :--- |
| **`merge-json.js`** | Plain JavaScript (Custom function) | Overwrites arrays. If a key exists in both files and contains an array, the entire array from the source file replaces the target's array. |
| **`deepmerge.js`** | `deepmerge` library | By default, **concatenates** arrays. This script is configured to **overwrite** arrays using a custom `arrayMerge` option. The `deepmerge` library is highly customizable. |
| **`lodash-merge.js`** | `lodash.merge` library | **Merges arrays by index**. This means it will merge objects within the arrays on a per-index basis. It will not concatenate or replace the array entirely, but rather combine the elements. |

-----

### Example 1: Complete Update

This example shows a partial update where the source file provides all necessary properties, resulting in a consistent output for all three merge methods.

**Source (`AllergyIntolerance-604a-pat-sf-partial-update.json`)**

```json
{
  "resourceType" : "AllergyIntolerance",
  "clinicalStatus" : {
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
      "code" : "inactive"
    }]
  },
  "note" : [{
    "text" : "Duplicated allergy in record. Removed."
  }]
}
```

**Target (`AllergyIntolerance-604a-pat-sf.json`)**

```json
{
  "resourceType" : "AllergyIntolerance",
  "id" : "604a-pat-sf",
  "meta" : {
    "profile" : ["https://smartforms.csiro.au/ig/StructureDefinition/SHCAllergyIntolerance"]
  },
  "clinicalStatus" : {
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
      "code" : "active"
    }]
  },
  "code" : {
    "coding" : [{
      "system" : "http://snomed.info/sct",
      "code" : "412583005",
      "display" : "Bee pollen"
    }],
    "text" : "Bee pollen"
  },
  "patient" : {
    "reference" : "Patient/pat-sf"
  },
  "note" : [{
    "text" : "comment"
  }],
  "reaction" : [{
    "manifestation" : [{
      "coding" : [{
        "system" : "http://snomed.info/sct",
        "code" : "271807003",
        "display" : "Rash"
      }],
      "text" : "Rash"
    }]
  }]
}
```

| Script Name | Resulting JSON | Explanation |
| :--- | :--- | :--- |
| **`merge-json.js`** or **`deepmerge.js`** | `json{ "resourceType": "AllergyIntolerance", "id": "604a-pat-sf", "meta": { "profile": ["https://smartforms.csiro.au/ig/StructureDefinition/SHCAllergyIntolerance"] }, "clinicalStatus": { "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", "code": "inactive" }] }, "code": { "coding": [{ "system": "http://snomed.info/sct", "code": "412583005", "display": "Bee pollen" }], "text": "Bee pollen" }, "patient": { "reference": "Patient/pat-sf" }, "note": [{ "text": "Duplicated allergy in record. Removed." }], "reaction": [{ "manifestation": [{ "coding": [{ "system": "http://snomed.info/sct", "code": "271807003", "display": "Rash" }], "text": "Rash" }] }] }` | The `clinicalStatus` object is fully overwritten by the source object. The `note` array is also fully overwritten. Other properties from the target, such as `id` and `code`, are preserved. The final output is identical to the `lodash-merge` result because the source provides all necessary data. |
| **`lodash-merge.js`** | `json{ "resourceType": "AllergyIntolerance", "id": "604a-pat-sf", "meta": { "profile": ["https://smartforms.csiro.au/ig/StructureDefinition/SHCAllergyIntolerance"] }, "clinicalStatus": { "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", "code": "inactive" }] }, "code": { "coding": [{ "system": "http://snomed.info/sct", "code": "412583005", "display": "Bee pollen" }], "text": "Bee pollen" }, "patient": { "reference": "Patient/pat-sf" }, "note": [{ "text": "Duplicated allergy in record. Removed." }], "reaction": [{ "manifestation": [{ "coding": [{ "system": "http://snomed.info/sct", "code": "271807003", "display": "Rash" }], "text": "Rash" }] }] }` | Lodash merges objects by property and arrays by index. It merges the `clinicalStatus` object, with the source values for `system` and `code` overwriting the target's. The `note` array is also merged, with the source note's `text` overwriting the target's. The final output is identical to the `merge-json.js` result in this specific case. |

-----

### Example 2: Partial Update with missing "system" property

This example shows how the `lodash` merge retains properties from the target file, while the other methods overwrite the entire array.

**Source (`AllergyIntolerance-604a-pat-sf-partial-update-min.json`)**

```json
{
  "resourceType" : "AllergyIntolerance",
  "clinicalStatus" : {
    "coding" : [{
      "code" : "inactive"
    }]
  },
  "note" : [{
    "text" : "Duplicated allergy in record. Removed."
  }]
}
```

**Target (`AllergyIntolerance-604a-pat-sf.json`)**

```json
{
  "resourceType" : "AllergyIntolerance",
  "id" : "604a-pat-sf",
  "meta" : {
    "profile" : ["https://smartforms.csiro.au/ig/StructureDefinition/SHCAllergyIntolerance"]
  },
  "clinicalStatus" : {
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
      "code" : "active"
    }]
  },
  "code" : {
    "coding" : [{
      "system" : "http://snomed.info/sct",
      "code" : "412583005",
      "display" : "Bee pollen"
    }],
    "text" : "Bee pollen"
  },
  "patient" : {
    "reference" : "Patient/pat-sf"
  },
  "note" : [{
    "text" : "comment"
  }],
  "reaction" : [{
    "manifestation" : [{
      "coding" : [{
        "system" : "http://snomed.info/sct",
        "code" : "271807003",
        "display" : "Rash"
      }],
      "text" : "Rash"
    }]
  }]
}
```

| Script Name | Resulting JSON | Explanation |
| :--- | :--- | :--- |
| **`merge-json.js`** or **`deepmerge.js`** | `json{ "resourceType": "AllergyIntolerance", "id": "604a-pat-sf", "meta": { "profile": ["https://smartforms.csiro.au/ig/StructureDefinition/SHCAllergyIntolerance"] }, "clinicalStatus": { "coding": [{ "code": "inactive" }] }, "code": { "coding": [{ "system": "http://snomed.info/sct", "code": "412583005", "display": "Bee pollen" }], "text": "Bee pollen" }, "patient": { "reference": "Patient/pat-sf" }, "note": [{ "text": "Duplicated allergy in record. Removed." }], "reaction": [{ "manifestation": [{ "coding": [{ "system": "http://snomed.info/sct", "code": "271807003", "display": "Rash" }], "text": "Rash" }] }] }` | The `clinicalStatus.coding` array is overwritten by the source's array, which removes the `system` property. This results in an **invalid FHIR resource** because the `system` is a required element. The `note` array is also completely overwritten. Other properties from the target, such as `id` and `code`, are preserved. |
| **`lodash-merge.js`** | `json{ "resourceType": "AllergyIntolerance", "id": "604a-pat-sf", "meta": { "profile": ["https://smartforms.csiro.au/ig/StructureDefinition/SHCAllergyIntolerance"] }, "clinicalStatus": { "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", "code": "inactive" }] }, "code": { "coding": [{ "system": "http://snomed.info/sct", "code": "412583005", "display": "Bee pollen" }], "text": "Bee pollen" }, "patient": { "reference": "Patient/pat-sf" }, "note": [{ "text": "Duplicated allergy in record. Removed." }], "reaction": [{ "manifestation": [{ "coding": [{ "system": "http://snomed.info/sct", "code": "271807003", "display": "Rash" }], "text": "Rash" }] }] }` | **This is the only method that produces the intended and valid FHIR output.** Lodash merges the `clinicalStatus.coding` array by index. The `code` from the source overwrites the target's `code`, but the target's **`system` is preserved**, which is a required element for a valid FHIR resource. The `note` array's text is overwritten. Other properties are preserved. |