/**
 * @fileoverview Tests for tokenize().
 * @author Nicholas C. Zakas
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("assert"),
    espree = require("../../espree"),
    tester = require("./tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("tokenize()", () => {

    it("should have `ecmaVersion: 5` as default", () => {

        // FIXME: is there a way to test that it isn't `ecmaVersion: 3`?

        // needs `ecmaVersion: 6` or higher
        assert.throws(() => {
            espree.tokenize("`template`");
        });
    });

    it("should produce tokens when using let", () => {
        const tokens = espree.tokenize("let foo = bar;", {
            ecmaVersion: 6,
            loc: true,
            range: true
        });

        assert.deepStrictEqual(tester.getRaw(tokens), require("../fixtures/tokenize/let-result.tokens.js"));
    });

    it("should produce tokens when using const", () => {
        const tokens = espree.tokenize("const foo = bar;", {
            ecmaVersion: 6,
            loc: true,
            range: true
        });

        assert.deepStrictEqual(tester.getRaw(tokens), require("../fixtures/tokenize/const-result.tokens.js"));
    });

    it("should produce tokens when using regular expression u flag", () => {
        const tokens = espree.tokenize("var foo = /foo/u;", {
            ecmaVersion: 6,
            loc: true,
            range: true
        });

        assert.deepStrictEqual(tester.getRaw(tokens), require("../fixtures/tokenize/regexp-u-result.tokens.js"));
    });

    it("should produce tokens when using regular expression y flag", () => {
        const tokens = espree.tokenize("var foo = /foo/y;", {
            ecmaVersion: 6,
            loc: true,
            range: true
        });

        assert.deepStrictEqual(tester.getRaw(tokens), require("../fixtures/tokenize/regexp-y-result.tokens.js"));
    });


    describe("templateStrings", () => {
        it("should produce tokens when tokenizing simple template string", () => {
            const tokens = espree.tokenize("var foo = `hi`;", {
                ecmaVersion: 6,
                loc: true,
                range: true
            });

            assert.deepStrictEqual(tester.getRaw(tokens), require("../fixtures/tokenize/template-string-simple-result.tokens.js"));
        });

        it("should produce tokens when tokenizing template string with embedded variable", () => {
            const tokens = espree.tokenize("var foo = `hi${bar}`;", {
                ecmaVersion: 6,
                loc: true,
                range: true
            });

            assert.deepStrictEqual(tester.getRaw(tokens), require("../fixtures/tokenize/template-string-embedded-result.tokens.js"));
        });

        it("should produce tokens when tokenizing template string with embedded variable in function call", () => {
            const tokens = espree.tokenize("var a; console.log(`${a}`, \"a\");", {
                ecmaVersion: 6,
                loc: true,
                range: true
            });

            assert.deepStrictEqual(tester.getRaw(tokens), require("../fixtures/tokenize/template-string-embedded2-result.tokens.js"));
        });

        it("should produce tokens when parsing template string with embedded variable in function call and with tokens options on", () => {
            const ast = espree.parse("var a; console.log(`${a}`, \"a\");", {
                ecmaVersion: 6,
                tokens: true,
                loc: true,
                range: true
            });

            assert.deepStrictEqual(tester.getRaw(ast.tokens), require("../fixtures/tokenize/template-string-embedded2-result.tokens.js"));
        });

        it("should produce tokens when tokenizing template string with embedded expressions", () => {
            const tokens = espree.tokenize("var foo = `Hello ${b}. a + 5 = ${a + 5}`;", {
                ecmaVersion: 6,
                loc: true,
                range: true
            });

            assert.deepStrictEqual(tester.getRaw(tokens), require("../fixtures/tokenize/template-string-expressions-result.tokens.js"));
        });


    });

    // Make sure we don't introduce the same regex parsing error as Esprima
    it("should produce tokens when using regular expression wrapped in parens", () => {
        const tokens = espree.tokenize("(/foo/).test(bar);", {
            loc: true,
            range: true
        });

        assert.deepStrictEqual(tester.getRaw(tokens), require("../fixtures/tokenize/regex-in-parens-result.tokens.js"));
    });

    it("should produce tokens when using regular expression wrapped in parens using parse()", () => {
        const ast = espree.parse("(/foo/).test(bar);", {
            loc: true,
            range: true,
            tokens: true
        });

        assert.deepStrictEqual(tester.getRaw(ast.tokens), require("../fixtures/tokenize/regex-in-parens-result.tokens.js"));
    });

    it("should produce tokens when using not operator", () => {
        const ast = espree.parse("!x", {
            loc: true,
            range: true,
            tokens: true
        });

        assert.deepStrictEqual(tester.getRaw(ast.tokens), require("../fixtures/tokenize/not-operator.tokens.js"));
    });

    it("should produce tokens when using tilde operator", () => {
        const ast = espree.parse("~x", {
            loc: true,
            range: true,
            tokens: true
        });

        assert.deepStrictEqual(tester.getRaw(ast.tokens), require("../fixtures/tokenize/tilde-operator.tokens.js"));
    });

    it("should produce tokens when using a single identifier", () => {
        const tokens = espree.tokenize("a");

        assert.deepStrictEqual(tester.getRaw(tokens), [{ type: "Identifier", value: "a" }]);
    });

    it("should not remove } token followed by a template literal.", () => {
        let tokens = espree.tokenize("const obj = {}\n`template${{}}!`", { ecmaVersion: 6 });

        assert.deepStrictEqual(
            tester.getRaw(tokens),
            [
                { type: "Keyword", value: "const" },
                { type: "Identifier", value: "obj" },
                { type: "Punctuator", value: "=" },
                { type: "Punctuator", value: "{" },
                { type: "Punctuator", value: "}" },
                { type: "Template", value: "`template${" },
                { type: "Punctuator", value: "{" },
                { type: "Punctuator", value: "}" },
                { type: "Template", value: "}!`" }
            ]
        );

        tokens = espree.tokenize("if (a) { b }\n`template`", { ecmaVersion: 6 });
        assert.deepStrictEqual(
            tester.getRaw(tokens),
            [
                { type: "Keyword", value: "if" },
                { type: "Punctuator", value: "(" },
                { type: "Identifier", value: "a" },
                { type: "Punctuator", value: ")" },
                { type: "Punctuator", value: "{" },
                { type: "Identifier", value: "b" },
                { type: "Punctuator", value: "}" },
                { type: "Template", value: "`template`" }
            ]
        );
    });

    it("should not mutate config", () => {
        espree.tokenize("foo", Object.freeze({ ecmaFeatures: Object.freeze({}) }));
    });

    /**
     * Make sure we tokenize closing curly brace in a block statement at end of file
     * @see https://github.com/eslint/espree/issues/403 for more information
     */
    it("should produce tokens when } is the last token", () => {
        const tokens = espree.tokenize("{}");

        assert.deepStrictEqual(
            tester.getRaw(tokens),
            [
                { type: "Punctuator", value: "{" },
                { type: "Punctuator", value: "}" }
            ]
        );
    });

});
