const core = require("@actions/core");
const github = require("@actions/github");

const token = (process.env.LOCAL)?process.env.TOKEN:core.getInput("token");
const octokit = github.getOctokit(token);        

const { ref,repository: { owner: { name: owner }, name: repo } } 
    = (process.env.LOCAL)?require("./local-payload.json"):github.context.payload;
const tag_name = ((ref) && (ref.startsWith("refs/tags/")))?ref.substr(10):null;
const version = tag_name?tag_name.substr(1):null;

if (process.env.LOCAL)
{
    core.setOutput = (name,value) => console.log(name,value);
    octokit.rest.repos.createRelease = (opt) => ({type: "simulated",opt});
}

/// Extracts the lines from the CHANGELOG.md (if it exists) in the section matching
/// `version`
async function extractChanges(content,version)
{
    try
    {
        const ret = [];
        let recording = false;
        content.split("\n").forEach((line) => 
        {
            const res = /^\s*##\s+v?(\d+\.\d+\.\d+)\s*$/.exec(line);
            if (res)
            {
                recording = (res[1]==version);
            }
            else if (recording)
            {
                ret.push(line);
            }        
        });
        return ret.join("\n").trim();    
    }
    catch(err)
    {
        console.log("error: ",err);
        return "";
    }
}

/// Extract the content of the file at `path` in the repo as the current reference.
async function getFileContent(path)
{
    try
    {
        const res = await octokit.rest.repos.getContent({
            owner,
            repo,
            path
        });
        if ((res.status==200) && (res.data))
        {
            const buf = Buffer.from(res.data.content,res.data.encoding);
            return buf.toString("utf8");    
        }
        else
        {
            return "";
        }    
    }
    catch(err)
    {
        console.log("getFileContent error:",err);
        return "";
    }
}

async function run()
{        
    if (ref)
    {        
        const res = await octokit.rest.repos.createRelease({
            owner,
            repo,
            tag_name,
            name: `release ${version}`,
            body: await extractChanges(await getFileContent("CHANGELOG.md"),version)
        });
        core.setOutput("response",res);
        console.log(`Release '${tag_name}' created successfully`);
    }
    else
    {
        throw "ref must be a tag";
    }
}

run();