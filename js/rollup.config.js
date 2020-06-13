export default {
    input: "index.js",
    output: {
        file: "bundle.js",
        format: "es"
    },
    watch: {
        chokidar: {
            paths: "./**"
        }
    }
};