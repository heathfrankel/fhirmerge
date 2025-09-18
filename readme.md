### FHIR JSON Merge Utilities

This repository contains three Node.js command-line utilities for merging a partially formed FHIR resource into a fully represented FHIR resource using JSON.

  * The **`merge-json.js`** script uses a plain JavaScript function to overwrite arrays.
  * The **`deepmerge.js`** script (using the `deepmerge` library) is configured to overwrite arrays by default.
  * The **`lodash-merge.js`** script (using the `lodash` library) handles arrays differently by merging objects within the arrays on an index-by-index basis, preserving existing properties where possible.

Although these merge utilities are generic for any JSON data, they can be used to support the update of an existing valid FHIR resource with new or updated data from a partially formed FHIR resource.

-----

**Disclaimer:** This is a proof of concept for further investigation and development and is not intended to be used as is in any real implementation.

-----

### Prerequisites

To run these scripts, you need to have Node.js installed. All required dependencies can be installed using a single command: `npm install`.

If you only want to use a specific script, you can install the dependencies separately as follows:

  * **`deepmerge.js`**: Requires the `deepmerge` library.
    `npm install deepmerge`
  * **`lodash-merge.js`**: Requires the `lodash` library.
    `npm install lodash`

-----

### Usage

All three utilities are run from the command line with the same basic syntax.

`node <script_name.js> <source_file.json> <target_file.json>`

The result of the merge will be printed to standard output (stdout), so you can redirect it to a new file.

Example: `node lodash-merge.js AllergyIntolerance-604a-pat-sf-partial-update.json AllergyIntolerance-604a-pat-sf.json > merged.json`

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

**Result for all three scripts (`merge-json.js`, `deepmerge.js`, and `lodash-merge.js`)**

```json
{
  "resourceType": "AllergyIntolerance",
  "id": "604a-pat-sf",
  "meta": {
    "profile": ["https://smartforms.csiro.au/ig/StructureDefinition/SHCAllergyIntolerance"]
  },
  "clinicalStatus": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
      "code": "inactive"
    }]
  },
  "code": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "412583005",
      "display": "Bee pollen"
    }],
    "text": "Bee pollen"
  },
  "patient": {
    "reference": "Patient/pat-sf"
  },
  "note": [{
    "text": "Duplicated allergy in record. Removed."
  }],
  "reaction": [{
    "manifestation": [{
      "coding": [{
        "system": "http://snomed.info/sct",
        "code": "271807003",
        "display": "Rash"
      }],
      "text": "Rash"
    }]
  }]
}
```

*Explanation:* The **`merge-json.js`** and **`deepmerge.js`** scripts overwrite the entire `clinicalStatus` object and `note` array. The final output is identical for all three scripts because the source provides all necessary data and no merging by index is required for a valid result. While **`lodash-merge.js`** handles arrays differently by attempting to merge by index, in this specific case, the source file provides a complete object for the `clinicalStatus.coding` array, which includes both the `system` and `code` sub-elements. This means there are no missing elements for `lodash` to preserve from the target file, resulting in the same output as the other scripts that simply overwrite the array.

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

**Result for `merge-json.js` and `deepmerge.js`**

```json
{
  "resourceType": "AllergyIntolerance",
  "id": "604a-pat-sf",
  "meta": {
    "profile": ["https://smartforms.csiro.au/ig/StructureDefinition/SHCAllergyIntolerance"]
  },
  "clinicalStatus": {
    "coding": [{
      "code": "inactive"
    }]
  },
  "code": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "412583005",
      "display": "Bee pollen"
    }],
    "text": "Bee pollen"
  },
  "patient": {
    "reference": "Patient/pat-sf"
  },
  "note": [{
    "text": "Duplicated allergy in record. Removed."
  }],
  "reaction": [{
    "manifestation": [{
      "coding": [{
        "system": "http://snomed.info/sct",
        "code": "271807003",
        "display": "Rash"
      }],
      "text": "Rash"
    }]
  }]
}
```

*Explanation:* The `clinicalStatus.coding` array is overwritten by the source's array, which removes the `system` property. This results in an **invalid FHIR resource** because the `system` is a required element. The `note` array is also completely overwritten. Other properties from the target, such as `id` and `code`, are preserved.

**Result for `lodash-merge.js`**

```json
{
  "resourceType": "AllergyIntolerance",
  "id": "604a-pat-sf",
  "meta": {
    "profile": ["https://smartforms.csiro.au/ig/StructureDefinition/SHCAllergyIntolerance"]
  },
  "clinicalStatus": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
      "code": "inactive"
    }]
  },
  "code": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "412583005",
      "display": "Bee pollen"
    }],
    "text": "Bee pollen"
  },
  "patient": {
    "reference": "Patient/pat-sf"
  },
  "note": [{
    "text": "Duplicated allergy in record. Removed."
  }],
  "reaction": [{
    "manifestation": [{
      "coding": [{
        "system": "http://snomed.info/sct",
        "code": "271807003",
        "display": "Rash"
      }],
      "text": "Rash"
    }]
  }]
}
```

*Explanation:* **This is the only method that produces the intended and valid FHIR output.** Lodash merges the `clinicalStatus.coding` array by index. The `code` from the source overwrites the target's `code`, but the target's **`system` is preserved**, which is a required element for a valid FHIR resource. The `note` array's text is overwritten. Other properties are preserved.