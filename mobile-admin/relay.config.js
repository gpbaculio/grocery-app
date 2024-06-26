module.exports = {
    // ...
    // Configuration options accepted by the `relay-compiler` command-line tool and `babel-plugin-relay`.
    src: ".",
    language: "typescript", // "javascript" | "typescript" | "flow"
    schema: "./schema.graphql",
    excludes: ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"],
  }