const fs = require("fs");
const rules = require("gutenverse-core/.config/rules");
const path = require("path");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const { output } = require("../config");
const { stats, plugins } = require("gutenverse-core/.config/config");
const { externals, coreExternals, coreFrontendExternals } = require("gutenverse-core/.config/externals");
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

let copyPath = [];

fs.readdirSync("./src/editor/blocks/").filter(function (file) {
    const path = "./src/editor/blocks/" + file;

    if (fs.statSync(path).isDirectory()) {
        const jsonPath = path + "/block.json";
        if (fs.existsSync(jsonPath)) {
            copyPath.push({
                source: jsonPath,
                destination: "./gutenverse-form/block/" + file + "/block.json",
            });
        }
    }
});

const blocks = {
    mode: "development",
    devtool: "cheap-module-source-map",
    entry: {
        blocks: {
            import: path.resolve(__dirname, "../../src/editor/index.js"),
        },
    },
    externals: {
        ...externals,
        ...coreExternals,
        ...coreFrontendExternals
    },
    stats,
    output,
    module: {
        strictExportPresence: true,
        rules,
    },
    plugins: [
        ...plugins,
        new DependencyExtractionWebpackPlugin(),
        new FileManagerPlugin({
            events: {
                onEnd: {
                    copy: [
                        ...copyPath,
                        {
                            source: "./build/blocks.js",
                            destination: "./gutenverse-form/assets/js/",
                        },
                        {
                            source: "./build/blocks.asset.php",
                            destination: "./gutenverse-form/lib/dependencies/",
                        },
                    ],
                },
            },
            runTasksInSeries: true,
        }),
    ],
};

module.exports = {
    blocks,
};
