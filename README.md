[![Actions Status](https://github.com/ResearchSoftwareActions/CleanNotebookAction/workflows/tests/badge.svg)](https://github.com/ResearchSoftwareActions/CleanNotebookAction/actions)

# Jupyter Notebook metadata enforcement GitHub action

This GitHub action enforces rules on certain cells and metadata in Jupyter Notebooks.

Because Jupyter notebooks contain metadata such as `outputs` and `execution_count`, they do not lend themselves well to versioning unless the unnecessary information has first been removed.
This GitHub action can ensure that CI tests fail unless Jupyter notebooks have been appropriately linted prior to being pushed to the repository.

## Quickstart

Add the following step to your GitHub action:

```yaml
- uses: ResearchSoftwareActions/CleanNotebookAction@dev
```

## Checks

All of the following are checked by default:

### `outputs`

The Jupyter `outputs` field is a list of outputs from each cell.
These can include binary data.
By default the action will fail if `outputs` is not an empty list (`[]`).

### `execution_count`

The Jupyter `execution_count` field is an integer counting the number of cell executions.
By default the action will fail if `execution_count` is not `null`.

## Configure checks

This action takes one optional argument that specifies which checks should be disabled.

The full list of options are:

- `--disable-cells` disable checks relating to cell outputs
- `--disable-counts` disable checks relating to execution count

### Full example usage

```yaml
- uses: ResearchSoftwareActions/CleanNotebookAction@dev
  with:
    lint-args: --disable-counts
```
