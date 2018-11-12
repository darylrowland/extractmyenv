#!/usr/bin/env node

const fs = require("fs");

console.log("Running in ", __dirname);
const PROCESS_ENV_STR = "process.env";

var environmentVariables = [];

async function readFilesInDir(dir) {
    var files = fs.readdirSync(dir);

    for (file of files) {
        if (fs.statSync(dir + "/" + file).isDirectory()) {
            await readFilesInDir(dir + "/" + file);
        } else {
            // This is a file, read it
            await readFileAndExtractEnvironmentVariables(dir + "/" + file);
        }
    }

}

function readFileAndExtractEnvironmentVariables(file) {
    if (file.endsWith(".js")) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading", file);
                } else {
                    while (data.indexOf(PROCESS_ENV_STR) >= 0) {
                        var indexOfEnv = data.indexOf(PROCESS_ENV_STR);
    
                        var data = data.substr(indexOfEnv + PROCESS_ENV_STR.length + 1);
                        var processEnvName = "";
    
                        // With remaining data continue until we find break character
                        for (var i = 0; i < data.length; i++) {
                            if (data.charAt(i) === "\n" || data.charAt(i) === ";") {
                                if (processEnvName !== "") {
                                    environmentVariables[processEnvName] = {value: null};
                                }
                                data = data.substr(i);
                                break;
                            } else {
                                processEnvName += data.charAt(i);
                            }
                        }
    
                        if (processEnvName != "" ) {
                            environmentVariables[processEnvName] = {value: null};
                            data = data.substr(i);
                        }
                    }

                    resolve();
                }
            });
        });
    }
}

function printoutVariablesWithValues() {
    Object.keys(environmentVariables).forEach((key) => {
        console.log("export " + key + "=" + process.env[key]);
    });
}

async function start() {
    await readFilesInDir(process.cwd());
    printoutVariablesWithValues();
}

start();


