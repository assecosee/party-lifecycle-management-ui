import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { transformSync } from '@babel/core';
import { createEs2015LinkerPlugin } from '@angular/compiler-cli/linker/babel';
import http from 'http';
import crypto from 'crypto';
const argumentsData = process.argv.slice(2);
let buildInProgress = false;

const getFlag = (name) => {
  for (const flag of argumentsData) {
    if (flag.startsWith(name)) {
      return flag.split('=')[1];
    }
  }
  return null;
};


const containsFlag = (name) => {
  for (const flag of argumentsData) {
    if (flag === name) {
      return true;
    }
  }
  return false;
};

const project = process.env.PROJECT ?? argumentsData[0];
if (!project) {
  console.error('Project not provided. Please specify project');
  process.exit(1);
}

console.log('Working with project: ' + project);

const PORT = getFlag('--port') ?? 3000;

const createNgtscLogger = () => ({
  level: 1,
  debug: (...args) => {
    console.log('debug', args.join());
  },
  info: (...args) => {
    console.log('info', args.join());
  },
  warn: (...args) => {
    console.log('warn', args.join());
  },
  error: (...args) => {
    console.log('error', args.join());
  }
});

const compareVersions = (a, b) => {
  if (a === b) {
    return 0;
  }
  const a_components = a.split('.');
  const b_components = b.split('.');
  const len = Math.min(a_components.length, b_components.length);
  // loop while the components are equal
  for (let i = 0; i < len; i++) {
    // A bigger than B
    if (parseInt(a_components[i], 10) > parseInt(b_components[i], 10)) {
      return 1;
    }
    // B bigger than A
    if (parseInt(a_components[i], 10) < parseInt(b_components[i], 10)) {
      return -1;
    }
  }
  // If one's a prefix of the other, the longer one is greater.
  if (a_components.length > b_components.length) {
    return 1;
  }
  if (a_components.length < b_components.length) {
    return -1;
  }
  // Otherwise they are the same.
  return 0;
};

const ngCompilerPlugin = createEs2015LinkerPlugin({
  logger: createNgtscLogger(undefined),
  sourceMapping: false,
  fileSystem: {
    resolve: path.resolve,
    exists: fs.existsSync,
    dirname: path.dirname,
    relative: path.relative,
    readFile: fs.readFileSync,
  }
});

const replaceReload = (data) => data.replace(/\/\*\*STARTLIVERELOAD\*\/([.\S\s]+)\/\*\*ENDLIVERELOAD\*\//gm, '');

const hash = (data) => {
  data = replaceReload(data);
  return crypto.createHash('md5').update(data).digest('hex');
};

const shortenFileName = (data) => data.replace('.umd.js', '').replace('.js', '').replace(/[^a-z0-9]/gi, '');

const babelMinifyPath = './node_modules/babel-preset-minify';
if (!fs.existsSync(babelMinifyPath)) {
  console.log('Installing babel-preset-minify');
  execSync('npm i --save-dev babel-preset-minify');
  console.log('Installed babel-preset-minify');
}

const babelCorePath = './node_modules/@babel/core/package.json';
if (fs.existsSync(babelCorePath)) {
  console.log('Babel core exists. Checking version');
  // load version from package json
  const babelCorePackage = fs.readFileSync(babelCorePath, 'utf8');
  const babelCorePackageJson = JSON.parse(babelCorePackage);
  const babelCoreVersion = babelCorePackageJson.version;
  // check if version is higher then 7.18.0
  console.log('Babel core version: ' + babelCoreVersion);
  if (compareVersions('7.18.0', babelCoreVersion) === 1) {
    console.log('Installing newer @babel/core');
    execSync('npm i --save-dev @babel/core@~7.18.0');
    console.log('Installed newer @babel/core');
  }
} else {
  console.log('Babel core does not exists');
}

const isProduction = containsFlag('--production');
const isNoMinify = containsFlag('--no-minify');

if (!isProduction) {
  const babelNormalizePath = './node_modules/@babel/core/lib/transformation/normalize-file.js';
  if (fs.existsSync(babelNormalizePath)) {
    let babelFile = fs.readFileSync(babelNormalizePath, 'utf8');
    if (babelFile.indexOf('const LARGE_INPUT_SOURCEMAP_THRESHOLD = 1000000;')) {
      console.log('Changing default @babel/core source-map size threshold');
      babelFile = babelFile.replace('const LARGE_INPUT_SOURCEMAP_THRESHOLD = 1000000;'
        , 'const LARGE_INPUT_SOURCEMAP_THRESHOLD = 10000000;');
      fs.writeFileSync(babelNormalizePath, babelFile);
    }
  }
}

console.log('Starting compilation.');


if (isNoMinify) {
  console.log('Running in no-minify mode');
}

if (!isProduction) {
  console.log('Using Developer mode, to use Production build please specify --production flag');
  const distPath = './dist/' + project;
  let bundlesDir = distPath + '/fesm2022';
  const isBundleDir = fs.existsSync(bundlesDir);
  if (!isBundleDir) {
    bundlesDir = distPath;
  }
  console.log('Serving module at port: ' + PORT);
  http.createServer((req, res) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Max-Age': 2592000
    };

    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers);
      res.end();
      return;
    }
    if (req.method === 'GET') {
      let url = req.url;
      if (url.endsWith('?hash')) {
        url = url.replace('?hash', '');
        if (buildInProgress) {
          res.writeHead(404);
          res.end('Build in progress');
          return;
        }
        fs.readFile(bundlesDir + url, (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
          }
          const hashed = hash(data.toString());
          res.writeHead(200, headers);
          res.end(hashed);
        });
      }
      else {
        fs.readFile(bundlesDir + req.url, (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
          }
          res.writeHead(200, headers);
          res.end(data);
        });
      }
    }
  }).listen(PORT);
}

/**
 * Look ma, it's cp -R.
 */
const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName),
        path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

const callback = (stdout) => {
  console.log(stdout);
  if (stdout.indexOf('Build at:') !== -1
    || stdout.indexOf('compiled with') !== -1 || stdout.indexOf('compiled successfully') !== -1) {
    console.log('Build complete.');
    buildInProgress = true;
    const distPath = './dist/' + project;
    if (fs.existsSync(distPath)) {
      console.log('Dist location exists');
      let bundlesDir = distPath + '/fesm2022';
      const isBundleDir = fs.existsSync(bundlesDir);
      if (isBundleDir) {
        console.log('Handling standard FESM library');
      } else {
        bundlesDir = distPath;
        console.log('Assuming that library uses Webpack UMD Format');
      }
      const assetsPath = './projects/' + project + '/src/lib/assets';
      const targetDir = bundlesDir + '/assets';
      if (fs.existsSync(assetsPath)) {
        if (!fs.existsSync(targetDir)) {
          copyRecursiveSync(assetsPath, targetDir);
        }
      }
      let files = fs.readdirSync(bundlesDir);
      const mjsFiles = files.filter(x => x.endsWith('.mjs'));
      const umdFiels = files.filter(x => x.endsWith('.umd.min.js'));
      for (const file of files) {
        if (mjsFiles.length > 0 && umdFiels.length > 0) {
          if (file.endsWith('.umd.min.js')) {
            continue;
          }
        }
        const presets = [];
        const plugins = [];
        if ((file.endsWith('.js') || file.endsWith('.mjs')) && file.indexOf('vendor') === -1) {
          if (file.endsWith('.mjs')) {
            console.log('Building to ES5 and UMD and minify: ' + file);
            if (!isProduction) {
              console.log('Using NG compiler to compile Partial build');
              plugins.push(ngCompilerPlugin);
            }
            plugins.push('@babel/plugin-transform-modules-umd');
            plugins.push('@babel/plugin-transform-parameters');
            if (!isNoMinify) {
              presets.push(['minify', {
                mangle: false
              }]);
            }
          } else {
            if (!isProduction) {
              console.log('Using NG compiler to compile Partial build');
              plugins.push(ngCompilerPlugin);
            } else {
              console.log('Nothing to do to Webpack UMD file for production purposes');
            }
          }
          if (plugins.length > 0) {
            const fileName = bundlesDir + '/' + file;
            const fileNameUmd = fileName.replace('.mjs', '.umd.min.js');
            const fileUmd = file.replace('.mjs', '.umd.min.js');
            const originalFile = fs.readFileSync(fileName, 'utf-8');
            let result = transformSync(originalFile, {
              filename: fileName,
              plugins,
              presets,
              compact: !isNoMinify,
              parserOpts: { sourceType: 'unambiguous' },
              sourceMaps: !isProduction ? 'inline' : false,
            });
            let resultCode = result.code;
            result = null;
            resultCode = resultCode.replace('_interopNamespace(i0)', 'i0');
            resultCode = resultCode.replace('_interopNamespace(i0)', 'i0');
            resultCode = resultCode.replace('Symbol.toStringTag,{value:"Module"', 'Symbol.toStringTag,{value:"module"');
            resultCode = resultCode.replace('.__esModule)', '.__esModule || true)');
            if (!isProduction) {
              console.log('Replacing assets paths for development');
              const regex = new RegExp('assets\/', 'gm');
              if (resultCode.indexOf('http://localhost:' + PORT + '/assets/') === -1) {
                resultCode = resultCode.replace(regex, 'http://localhost:' + PORT + '/assets/');
              }
              if (!isProduction) {
                // sourcemap is special comment, STARTLIVERELOAD should be in new row
                resultCode += '\n';
              }
              resultCode = replaceReload(resultCode);
              const hashData = hash(resultCode);
              console.log('Hash of file is: ' + hashData);
              const shorten = shortenFileName(fileUmd);
              resultCode += '/**STARTLIVERELOAD*/window.hash' + shorten + '="' + hashData + '";';
              // eslint-disable-next-line max-len
              const urlShorten = 'url' + shorten;
              resultCode += 'const ' + urlShorten + ' = \'http://localhost:\' + \'' + PORT + '\' + \'/\' + \'' + fileUmd
                + '\' + \'?hash\';setInterval(() => {fetch(' + urlShorten
                + ').then((response) => {response.text().then((text) => {if (window[\'hash\' + \'' + shorten
                + '\'] !== text) {console.log("Reloading as changes detected");location.reload();}});});}, 3000);/**ENDLIVERELOAD*/';
            }
            fs.writeFileSync(fileNameUmd, resultCode);
            console.log('File: ' + fileName + ' compiled to: ' + fileNameUmd + ' successfully');
            if (!isProduction) {
              console.log('Access file at: http://localhost:' + PORT + '/' + fileUmd);
            }
          } else {
            const fileName = bundlesDir + '/' + file;
            let resultCode = fs.readFileSync(fileName, 'utf-8');
            resultCode = resultCode.replace('Symbol.toStringTag,{value:"Module"', 'Symbol.toStringTag,{value:"module"');
            fs.writeFileSync(fileName, resultCode);
          }
        } else {
          if (!isProduction) {
            console.log('Access file at: http://localhost:' + PORT + '/' + file);
          }
        }
      }
      // TODO: Extract module name for main js file
      let moduleJson = '';
      files = fs.readdirSync(bundlesDir);
      for (const file of files) {
        let index = 1;
        const priority = PORT / 100;
        const location = 'http://localhost:' + PORT + '/' + file;
        if (file.endsWith('.js')) {
          const moduleJsonFile = 'ci/assets/module.json';
          const moduleJsonVendorFile = 'ci/assets/module-vendor.json';

          if (moduleJson !== '') {
            moduleJson += ',\r\n';
          }
          if (file.indexOf('vendor') !== -1) {
            if (!fs.existsSync(moduleJsonVendorFile)) {
              moduleJson += '{\r\n  "location": "' + location + '",\r\n  "priority": "' + priority + '"\r\n}';
            } else {
              const fileData = fs.readFileSync(moduleJsonVendorFile, 'utf-8');
              const parsedModuleJson = JSON.parse(fileData);
              parsedModuleJson.location = location;
              moduleJson += JSON.stringify(parsedModuleJson, null, 2);
            }
          } else {
            const regex = /([a-zA-Z_]+).ɵmod/gm;
            if (regex) {
              if (!fs.existsSync(moduleJsonFile)) {
                const fileName = bundlesDir + '/' + file;
                const code = fs.readFileSync(fileName, 'utf-8');
                moduleJson += '{\r\n  "location": "' + location + '",\r\n  "priority": "' + (priority + index);
                if (code.match(regex)) {
                  const moduleNameValue = code.match(regex)[0].replace('.ɵmod', '');
                  moduleJson += '",\r\n  "module-name":"' + moduleNameValue;
                }
                moduleJson += '"\r\n}';
                index++;
              } else {
                const fileData = fs.readFileSync(moduleJsonFile, 'utf-8');
                const parsedModuleJson = JSON.parse(fileData);
                parsedModuleJson.location = location;
                moduleJson += JSON.stringify(parsedModuleJson, null, 2);
              }
            }
          }
        }
      }
      console.log('JSON for module.json:');
      console.log(moduleJson);
      buildInProgress = false;
    }
  }
};

const webPackConfigExists = fs.existsSync('./projects/' + project + '/webpack.config.js');
if (webPackConfigExists) {
  console.log('Detected WebPack config');
}
const options = {
  env: {
    PATH: process.env.PATH
  }
};
if (!isProduction) {
  options.env.DEVELOPMENT = 'true';
}
buildInProgress = true;
const execute = exec('ng build ' + project + (isProduction || webPackConfigExists ? '' : ' --watch'), options);
execute.stdout.on('data', (data) => {
  callback(data);
});
execute.stderr.on('data', (data) => {
  console.error(data);
});

execute.on('exit', (code) => {
  console.log('Build finished with code: ' + code);
  process.exit(code);
});
