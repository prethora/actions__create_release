const core = require("@actions/core");
const github = require("@actions/github");

// const token = (process.env.LOCAL)?process.env.TOKEN:core.getInput("token");
// const octokit = github.getOctokit(token);        

const { ref,repository: { owner: { name: owner }, name: repo } } 
    = (process.env.LOCAL)?require("./local-payload.json"):github.context.payload;
// const tag_name = ((ref) && (ref.startsWith("refs/tags/")))?ref.substr(10):null;    

async function run()
{        
    // core.setOutput("time",(new Date()).toTimeString());
}

run();