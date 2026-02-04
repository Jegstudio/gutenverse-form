const rules = require("gutenverse-core/.config/rules");
const path = require("path");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const { output } = require("../config");
const { stats, plugins } = require("gutenverse-core/.config/config");
const { externals, coreExternals } = require("gutenverse-core/.config/externals");
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

const emailTemplate = {
    mode: "development",
    devtool: "source-map",
    entry: {
        'email-template': {
            import: path.resolve(__dirname, "../../src/backend/email-template/index.js"),
        },
    },
    externals: {
        ...externals,
        ...coreExternals,
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
                onStart: {
                    delete: [
                        "./gutenverse-form/assets/js/email-template.js*",
                        "./gutenverse-form/lib/dependencies/email-template.asset.php",
                        "./gutenverse-form/assets/css/email-template.css"
                    ]
                },
                onEnd: {
                    copy: [
                        {
                            source: process.env.NODE_ENV === 'development' ? "./build/email-template.js*" : "./build/email-template.js",
                            destination: "./gutenverse-form/assets/js/",
                        },
                        {
                            source: "./build/email-template.asset.php",
                            destination: "./gutenverse-form/lib/dependencies/",
                        },
                        {
                            source: "./build/email-template.css",
                            destination: "./gutenverse-form/assets/css/",
                        }
                    ],
                },
            },
            runTasksInSeries: true,
        }),
    ],
};

module.exports = {
    emailTemplate,
};
