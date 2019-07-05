var pdf2png = require("../pdf2png/pdf2png");
var fs = require("fs");

var projectPath = __dirname.split("\\");
projectPath.pop();
projectPath = projectPath.join("\\");

var gsPath = projectPath + "\\executables\\ghostScript";

console.log("current executable ghostScript path" + gsPath)

// Rewrite the ghostscript path
pdf2png.ghostscriptPath = gsPath;

/**
 * 读取路径信息
 * @param {string} path 路径
 */
// Most simple example
pdf2png.convert("./public/filetext/" + "a8dc054295725c26526c31a4553017ba.PDF", function(resp){

	if(!resp.success){
		console.log("Something went wrong: " + resp.error);
		
		return;
	}

	fs.writeFile("test/"+resp.imgNum+".png", resp.data, function(err) {
		if(err) {
			console.log(err);
		}
	});
});
