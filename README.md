# BPE-Lab CFD

This repository hosts materials for the BPE-Lab CFD website.

## Building and Deploying the Site

The repository contains only static HTML, CSS and JavaScript. Any static web
host can serve the site. Before deploying, regenerate the search index and
commit the updated `search_index.json`:

```bash
node generate_search_index.js
```

Once the file is committed, upload the repository contents to your preferred
hosting provider (GitHub Pages or any static server).

## Generating `search_index.json`

Run the following command whenever you modify `.html` files:

```bash
node generate_search_index.js
```

The script scans all pages and writes a new `search_index.json` used by the
site's search box.

## Using the CFD Statistics Tool

`cfd_statistics.html` implements a simple mean calculator. Open the page in a
browser and drag a `.xlsx`, `.xls`, `.csv` or `.txt` file onto the drop area (or
click to select a file). The tool reads the first sheet or table, computes the
column averages and displays them in a table.



