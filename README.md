# GraphQL Markdown

[![Build Status](ADD_SHIELDS.IO_URL)](ADD_URL)
[![Coverage Status](ADD_SHIELDS.IO_URL)](ADD_URL)
[![NPM Version](ADD_SHIELDS.IO_URL)](ADD_URL)
[![NPM Downloads](ADD_SHIELDS.IO_URL)](ADD_URL)
[![Dependencies](ADD_SHIELDS.IO_URL)]()
[![Dev Dependencies](ADD_SHIELDS.IO_URL)]()

> Write markdown, generate GraphQL TypesDefs & Resolvers, query via GraphQL, and serve as html.🔥

TODO: Replace me with a gif of the pkg in action.

GraphQL Markdown is a simple library that

Simply put we parse your `.md`, converting the `.md` into `html` and automatically generating `GraphQL FieldDefinitions` from the markdown's `frontMatter`.🔥

After generating the `FieldDefinitions`, we save the processed data to an in-memory db. We export the generated `TypeDefs` and `Resolvers` to enable you to have complete control over creating your own GraphQL Schema.🎉

A simple GraphQL API for querying your processed content is provided. Which includes a way to `sort`, `limit`, and `skip` your results enabling a basic form of pagination. 🍾


## Table of Contents

* [Quick Start](#quick-start)
  * [Querying Your Data](#querying-your-data)
  * [Server Setup](#server-setup)
    * [Example 1 - Promise usage](#example-1-promise-usage)
    * [Example 2 - Async/Await](#example-2-async/await-usage)
  * [Markdown Files](#markdown-files)
    * [FrontMatter section](#frontmatter-section)
    * [Markdown section](#markdown-section)
    * [Putting it all together](#putting-it-all-together)
    * [Seeing it in Action](#seeing-it-in-action)
* [Testing](#testing)
* [Examples](#examples)
* [Maintainers](#maintainers)
* [Contributing](#contributing)
* [License](#license)

## Quick Start

**NOTE:** This package is still in development and is not yet published to the npm repository.

```sh
# With npm
npm install --save https://github.com/okgrow/graphql-markdown
# With Yarn
yarn add https://github.com/okgrow/graphql-markdown
```

### Querying Your Data

Graphql Markdown provides a few different approaches to querying the data extracted from your `.md` files.

* 💪&nbsp; A powerful & all purpose query: Search by logical `AND`, `OR` conditions on any fields!!! 🎉

```graphql
 contentItems(filter: FilterFields!, pagination: Pagination): [ContentItem!]
```

* 🎁&nbsp; Simplified helper queries: providing a clean & crisp syntax for common querying patterns. 🎊

```graphql
contentItemById(id: ID!): ContentItem
contentItemsByIds(ids: [ID!]!, pagination: Pagination): [ContentItem!]
contentItemsByGroupId(groupId: ID!, pagination: Pagination): [ContentItem!]
```

* 🎀&nbsp; Organise the query results: Simple syntax to `sort`, `skip`, and `limit` your results. 🎈

```graphql
enum OrderBy {
  ASCENDING
  DESCENDING
}

# Sort results by a specific field and order in Ascending or Descending order.
# e.g -> { sortBy: "date", orderBy: "DESCENDING" }
input Sort {
  sortBy: String!   # Field to sort by. e.g -> "date"
  orderBy: OrderBy! # ASCENDING or DESCENDING order. e.g -> "DESCENDING"
}

input Pagination {
  sort: Sort # Sort and order elements by a specific field in a specific order.
  skip: Int  # Do not return the first x elements.
  limit: Int # Limit the number of elements to return.
}
```

### Server Setup

```js
// server/index.js
import hljs from 'highlight.js'; // Only install/used if you want to highlight code.
import { makeExecutableSchema } from 'graphql-tools';
import { loadMarkdownIntoDb } from '@okgrow/graphql-markdown';

const isProduction = process.env.NODE_ENV === 'production';

// Simple example of imageFunc.
const serveImagesFromServer = ({ imgPath, contentRoot }) =>
  `/images${imgPath.slice(contentRoot.length)}`;

const replaceWords = ({ contentRoot, rawContents }) =>
  rawContents.replace(new RegExp('deployment-server', 'g'), `${isProduction ? 'production' : 'development'}`);

// NOTE: Simple example of highlighting code by using highlight.js. You can use
// any highlighter you like that conforms to the below function signature.
const yourCodeHighlighter = (code) => hljs.highlightAuto(code).value;

// Create our options for loading the markdown into our in memory db.
// NOTE: By default images are converted to base64 if no function is passed to imageFunc.
// NOTE: You shouldn't use base64 in production as it increases the size of images significantly.
// NOTE: imageFormats is optional, if not provided it will use the DEFAULT_SUPPORTED_IMAGE_FORMATS.
// imageFormats expects a string in the following format '(ext|ext|ext|..etc)'
const options = {
  contentRoot: `fullpath/to/root/of/content`,             // required
  imageFunc: isProduction ? serveImagesFromServer : null, // optional
  replaceContents: replaceWords,                          // optional
  imageFormats: '(png|svg)',                              // optional
  debugMode: true,                                        // optional
  codeHighlighter: yourCodeHighlighter,                   // optional
  },
};

// Continue on by selecting Example 1 - Promise or Example 2 - Async/Await
```


#### Example 1 - Promise usage

```js
// Continuation of server/index.js
//*** Example 1 - Promise ***/

// Find all markdown files, process and load them into memory and
// return the TypeDefs & Resolvers for the graphql-markdown pkg.
loadMarkdownIntoDb(options).then({
  graphqlMarkdownTypeDefs,
  graphqlMarkdownResolvers,
  numberOfFilesInserted,
} => {
  console.log(`DB ready!\n${numberOfFilesInserted} ContentItems loaded!`);
  // Create our GraphQL Schema
  const schema = makeExecutableSchema({
    typeDefs: graphqlMarkdownTypeDefs,
    resolvers: graphqlMarkdownResolvers,
  });

  // Now start your GraphQL Server using the schema you just created.
  // If your unsure how to do this check out the examples dir.

}).catch(error => {
  console.error('[loadMarkdownIntoDb]', error);
});
```

#### Example 2 - Async/Await usage

```js
// Continuation of server/index.js
/*** Example 2 - Async/Await ***/
(async () => {
  try {
    // Find all markdown files, process and load them into memory and
    // return the TypeDefs & Resolvers for the graphql-markdown pkg.
    const {
      graphqlMarkdownTypeDefs,
      graphqlMarkdownResolvers,
      numberOfFilesInserted,
    } = await loadMarkdownIntoDb(options);
    console.log(`DB ready!\n${numberOfFilesInserted} ContentItems loaded!`);

    const schema = makeExecutableSchema({
      typeDefs: graphqlMarkdownTypeDefs,
      resolvers: graphqlMarkdownResolvers,
    });

    // Now start your GraphQL Server using the schema you just created.
    // If your unsure how to do this check out the examples dir.

  } catch (error) {
    console.error('[loadMarkdownIntoDb]', error);
  }
})();
```

## Markdown files

A markdown file contains two distinct sections, the FrontMatter section and the Markdown section.

```
---
FrontMatter Section
---

Markdown Section
```

#### FrontMatter section

The FrontMatter section contains `key`:`value` pairs. Every Markdown file is required to contain a FrontMatter section and must contain an `id` and an `groupId` key-value pair. You can add as many additional `key`:`value` pairs as you like, we will generate `GraphQL Field Definitions` from these additional `key`:`value` at runtime. Check out the [typeDefs.graphql](./src/graphql/typeDefs.graphql) file to see where we inject these `Field Definitions`.

```md
---
id: myFirstMdFile
groupId: homePage
---
```

#### Markdown section

The Markdown section is placed after the FrontMatter section and contains your markdown content. The markdown content will be converted into valid HTML when we process all markdown files and store them in memory.

```md
# My First Markdown file

Hello World!
```

#### Putting it all together

```md
---
id: home-content-section-1
groupId: homePage
type: pageContent
title: Wonder Website
description: Wonder Website - Home Page
date: "2017-12-25"
tags: [Happy, Learnings]
---

# Welcome to this wonderful website!

Hello world!
Thanks for dropping by to say hello! 🔥🔥🔥
```

#### Seeing it in Action!

Run the simple-example found in `examples/simple`, and copy/paste the below snippet into GraphiQL to see the response yourself!🔥

```graphql
{
  # Simplified helper query to search for a single ContentItem.
  # Returns a ContentItem, else null if not found.
  contentItemById(id: "homePage") {
    html
    description
  }

  # Simplified helper query to search for ContentItems by ids.
  # Returns a List of contentItems, else empty List if none found.
  # Supports Pagination (sort, skip, limit).
  contentItemsByIds(ids: ["graphqlIntro", "homePage"]) {
    id
    tags
    order
  }

  # Simplified helper query to search for ContentItems by groupId.
  # Return a List of contentItems, else empty List if none found.
  # Supports Pagination (sort, skip, limit).
  contentItemsByGroupId(
    groupId: "simple-example"
    pagination: {
      sort: {
        sortBy: "order",
        orderBy: DESCENDING
      }
      skip: 0
      limit: 0
    }
  ) {
    id
    order
    groupId
  }

  # Full powered query to search for ContentItems by any field!!!
  # Supports searching by logical AND, OR conditions on any fields.
  # Return a List of contentItems, else empty List if none found.
  # Supports Pagination (sort, skip, limit).
  contentItems(
    filter: {
      AND: {
        order: 2,
        groupId: "simple-example"
        }
      }
    pagination: {
      sort: {
        sortBy: "order",
        orderBy: ASCENDING
        }
      }
  ) {
    id
    type
    date
    groupId
    description
  }
}
```

## Testing

```sh
# clone the repo
git clone git@github.com:okgrow/graphql-markdown.git
# Don't forget to install
npm install
# Run all tests (We use Jest)
npm test
```

## Examples

Check out the examples folder to see how it all works. Please note:

* Node version 8+ is required.
* You must run `npm install` on the main package first as the examples import the `/dist` files.
* Examples contain detailed instructions & example queries to copy paste into Graphiql.

## Maintainers

This is an open source package. We hope to deal with contributions in a timely manner, but that's not always the case. The main maintainers are:

[@cfnelson](https://github.com/cfnelson)
[@okgrow](https://github.com/okgrow)

Feel free to ping if there are open issues or pull requests which are taking a while to be dealt with!

## Contributing

Issues and Pull Requests are always welcome.

Please read our [contribution guidelines](https://github.com/okgrow/guides/blob/master/open-source/contributing.md).

If you are interested in becoming a maintainer, get in touch with us by sending an email or opening an issue. You should already have code merged into the project. Active contributors are encouraged to get in touch.

Please note that all interactions in @okgrow's repos should follow our [Code of Conduct](https://github.com/okgrow/guides/blob/master/open-source/CODE_OF_CONDUCT.md).

## License

Released under the [MIT license](https://github.com/okgrow/analytics/blob/master/License.md) © 2017 OK GROW!.
