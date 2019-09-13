var path = require('path'), fs=require('fs');

function fromDir(startPath,filter){
    var filteredFiles = [];
    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        if (filename.indexOf(filter)>=0) {
            filteredFiles.push(filename);
        };
    };
    return filteredFiles;
};

var javascriptFiles = fromDir('./dist','.js');
var removeComments = /\/\/([^/]*?)\\n/g
var removeNewLines = /  +/g
var removeSpacesBeforeColon = /\; +/g
var removeSpacesAfterColon = /\} +/g
var base = __dirname+'/';

javascriptFiles.forEach(function(file){

    if(file.indexOf('g.js') >=0){
        console.log(base+file);
        var filePath = path.join(__dirname, file);
        var fileContent = fs.readFileSync(filePath, 'utf8');
        fileContent = fileContent.replace(removeComments, '');
        fileContent = fileContent.replace(removeNewLines, '');


        fileContent = fileContent.replace(/, /g, ',');
        fileContent = fileContent.replace(/ = /g, '=');
        fileContent = fileContent.replace(/\. /g, '.');
        fileContent = fileContent.replace(/ < /g, '<');
        fileContent = fileContent.replace(/ > /g, '>');
        fileContent = fileContent.replace(/ == /g, '==');
        fileContent = fileContent.replace(/ -= /g, '-=');
        fileContent = fileContent.replace(/ >= /g, '>=');
        fileContent = fileContent.replace(/ <= /g, '<=');
        fileContent = fileContent.replace(/ - /g, '-');
        fileContent = fileContent.replace(/ \+= /g, '+=');
        fileContent = fileContent.replace(/ != /g, '!=');
        fileContent = fileContent.replace(/ \/= /g, '/=');
        fileContent = fileContent.replace(/ \*= /g, '*=');
        fileContent = fileContent.replace(/ && /g, '&&');
        fileContent = fileContent.replace(/; /g, ';');
        fileContent = fileContent.replace(/ \+ /g, '+');
        fileContent = fileContent.replace(/ \./g, '.');
        fileContent = fileContent.replace(/ ,/g, ',');
        fileContent = fileContent.replace(/&& /g, '&&');
        fileContent = fileContent.replace(/\( /g, '(');

        

        
        // fileContent = fileContent.replace(removeSpacesBeforeColon, ';');
        // fileContent = fileContent.replace(removeSpacesAfterColon, '}');




        //WORD TRANSFORMS
        fileContent = fileContent.replace(/terrainHeight/g, 'tH');
        fileContent = fileContent.replace(/waterCurrents/g, 'wC');
        fileContent = fileContent.replace(/objectsShape/g, 'oS');
        fileContent = fileContent.replace(/mapDecorations/g, 'mD');
        fileContent = fileContent.replace(/waterQuantity/g, 'wQ');
        fileContent = fileContent.replace(/myBoatsColor/g, 'bC');
        fileContent = fileContent.replace(/finalDestinationCorner/g, 'dC');
        fileContent = fileContent.replace(/shaderFunctions/g, 'sF');
        fileContent = fileContent.replace(/finalDestDeco/g, 'fD');
        fileContent = fileContent.replace(/drawLine/g, 'dL');
        fileContent = fileContent.replace(/finalDestTrr/g, 'fT');
        fileContent = fileContent.replace(/drawDonut/g, 'dD');
        fileContent = fileContent.replace(/blockers/g, 'bL');

        fileContent = fileContent.replace(/ballsCollisionForce/g, 'bF');
        fileContent = fileContent.replace(/ballsCollisionDamping/g, 'bD');
        fileContent = fileContent.replace(/waterPushByPlayer/g, 'wP');
        fileContent = fileContent.replace(/wCForceOfMap/g, 'wC');
        fileContent = fileContent.replace(/waterFrictionToObjects/g, 'wF');
        fileContent = fileContent.replace(/tHForce/g, 'tH');
        fileContent = fileContent.replace(/objectsBarLength/g, 'oL');
        fileContent = fileContent.replace(/objectsBarForce/g, 'oF');
        fileContent = fileContent.replace(/objectsBarDamping/g, 'oD');


        fileContent = fileContent.replace(/unlockedLevels/g, 'uL');
        fileContent = fileContent.replace(/baseOperations/g, 'bO');
        fileContent = fileContent.replace(/shaderCreator/g, 'sC');
        fileContent = fileContent.replace(/meshBuff/g, 'mB');
        fileContent = fileContent.replace(/texWidth/g, 'tW');
        fileContent = fileContent.replace(/texHeight/g, 'th');
        fileContent = fileContent.replace(/shaderMtx/g, 'sX');
        fileContent = fileContent.replace(/fillTex0/g, 'f0');
        fileContent = fileContent.replace(/fillTex1/g, 'f1');
        fileContent = fileContent.replace(/fillTex2/g, 'f2');
        fileContent = fileContent.replace(/levelEnded/g, 'lE');
        fileContent = fileContent.replace(/frameCounter/g, 'fC');
        fileContent = fileContent.replace(/confetti/g, 'cF');



        //shaders
        fileContent = fileContent.replace(/shaderP0/g, '$1');
        fileContent = fileContent.replace(/shdVtx0/g, '$2');
        fileContent = fileContent.replace(/shdMtx0/g, '$3');
        fileContent = fileContent.replace(/shdTex0/g, '$4');
        fileContent = fileContent.replace(/shaderP1/g, '$5');
        fileContent = fileContent.replace(/shdVtx1/g, '$6');
        fileContent = fileContent.replace(/shdMtx1/g, '$7');
        fileContent = fileContent.replace(/shdTex10/g, '$8');
        fileContent = fileContent.replace(/shdTex11/g, '$9');
        fileContent = fileContent.replace(/shaderP2/g, '$10');
        fileContent = fileContent.replace(/shdVtx2/g, '$11');
        fileContent = fileContent.replace(/shdMtx2/g, '$12');
        fileContent = fileContent.replace(/shdTex2/g, '$13');
        fileContent = fileContent.replace(/shaderP3/g, '$14');
        fileContent = fileContent.replace(/shdVtx3/g, '$15');
        fileContent = fileContent.replace(/shdMtx3/g, '$16');
        fileContent = fileContent.replace(/shdTex30/g, '$17');
        fileContent = fileContent.replace(/shdTex31/g, '$18');
        fileContent = fileContent.replace(/shaderP4/g, '$19');
        fileContent = fileContent.replace(/shdVtx4/g, '$20');
        fileContent = fileContent.replace(/shdMtx4/g, '$21');
        fileContent = fileContent.replace(/shdTex40/g, '$22');
        fileContent = fileContent.replace(/shdTex41/g, '$23');
        fileContent = fileContent.replace(/shdTex42/g, '$24');
        fileContent = fileContent.replace(/shaderP9/g, '$25');
        fileContent = fileContent.replace(/shdVtx9/g, '$26');
        fileContent = fileContent.replace(/shdMtx9/g, '$27');
        fileContent = fileContent.replace(/shdTex90/g, '$28');
        fileContent = fileContent.replace(/shdTex91/g, '$29');
        fileContent = fileContent.replace(/shaderP10/g, '$30');
        fileContent = fileContent.replace(/shdVtx10/g, '$31');
        fileContent = fileContent.replace(/shdMtx10/g, '$32');
        fileContent = fileContent.replace(/shdTex100/g, '$33');
        fileContent = fileContent.replace(/shdTex101/g, '$34');
        fileContent = fileContent.replace(/shdTex102/g, '$35');
        fileContent = fileContent.replace(/shaderP11/g, '$36');
        fileContent = fileContent.replace(/shdVtx11/g, '$37');
        fileContent = fileContent.replace(/shdMtx11/g, '$38');
        fileContent = fileContent.replace(/shdTex110/g, '$39');
        fileContent = fileContent.replace(/shdTex111/g, '$40');
        fileContent = fileContent.replace(/shaderP12/g, '$41');
        fileContent = fileContent.replace(/shdVtx12/g, '$42');
        fileContent = fileContent.replace(/shdMtx12/g, '$43');
        fileContent = fileContent.replace(/shdTex120/g, '$44');
        fileContent = fileContent.replace(/shdTex121/g, '$45');
        fileContent = fileContent.replace(/shaderP15/g, '$46');
        fileContent = fileContent.replace(/shdVtx15/g, '$47');
        fileContent = fileContent.replace(/shdTex150/g, '$48');
        fileContent = fileContent.replace(/shdTex151/g, '$49');
        // fileContent = fileContent.replace(/shaderP6/g, '$50');
        // fileContent = fileContent.replace(/shdVtx6/g, '$51');
        // fileContent = fileContent.replace(/shdMtx6/g, '$52');
        // fileContent = fileContent.replace(/shdTex6/g, '$53');
        // fileContent = fileContent.replace(/shaderPS/g, '$54');
        // fileContent = fileContent.replace(/shdVtxS/g, '$55');
        // fileContent = fileContent.replace(/shdMtxS/g, '$56');
        // fileContent = fileContent.replace(/shdTexS0/g, '$57');
        // fileContent = fileContent.replace(/shdTexS1/g, '$58');
        // fileContent = fileContent.replace(/shdTexS2/g, '$59');
        // fileContent = fileContent.replace(/shdTexS3/g, '$60');
        // fileContent = fileContent.replace(/shdTexS4/g, '$61');


        // fileContent = fileContent.replace(/;\\n/g, ';');
        fileContent = fileContent.replace(/\\n/g, '');

        // fileContent = fileContent.replace(/(\\n)/g, '');






        fs.writeFileSync(filePath, fileContent);
        console.log("FIXING FILE", file);
    }
})
