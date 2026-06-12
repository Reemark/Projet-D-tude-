const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support 3D asset formats for Three.js / A-Frame models
config.resolver.assetExts.push('glb', 'gltf', 'bin', 'hdr');

module.exports = config;
