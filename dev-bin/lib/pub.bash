function _processHelp
{
    if [[ "$#" == 1 ]] && [[ "$1" =~ ^(-h)|(--help)$ ]]; then

cat << EOF
Create a tag on HEAD (only on the master branch) matching the version field in the package.json file,
prefixed with a 'v', and push the tag to origin. Only works if there are no local changes. Also creates or
moves minor and major tags, e.g. for version 1.1.2, creates the following tags: v1.1.2, v1.1, v1

Note: if any of the tags already exist, they will be moved.

USAGE

  ./dev-bin/pub [OPTIONS]

OPTIONS

  -y,--yes      automatically answer 'y' to all interactive confirmation messages.
  -h,--help     show this help page.

EOF

        exit 0
    fi
}

function _loadArgs
{
    local ARGS=( "$@" )
    
    extractFlag "-f" "--force" "|" "${ARGS[@]}"
    FORCE="$EF_FLAG"
    ARGS=( "${EF_REMAINING_ARGS[@]}" )

    extractFlag "-y" "--yes" "|" "${ARGS[@]}"
    YES="$EF_FLAG"
    ARGS=( "${EF_REMAINING_ARGS[@]}" )

    if [[ "${#ARGS[@]}" -gt 1 ]]; then
        echo "fatal: expecting at most 1 argument"
        exit 1
    elif [[ "${#ARGS[@]}" == 1 ]]; then
        MESSAGE="${ARGS[0]}"
    fi
}

function validatePublishable
{
    local CURRENT_BRANCH="$(getCurrentBranch)"
    [[ "$CURRENT_BRANCH" != "master" ]] && echo "fatal: can only publish from the master branch" && exit 1

    local MASTER_COMMIT_COUNT=$(getCommitCount "master")
    [[ "$MASTER_COMMIT_COUNT" == 0 ]] && echo "fatal: the master branch must be saved before being published" && exit 1

    isSaveable && echo -e "fatal: you cannot publish the master branch with working changes - save it first, or run \`git stash push -u\` \nto stash the changes and run \`git stash pop\` after publishing to restore them." && exit 1
}

function getPackageVersion
{
    node -e "console.log(require('./package.json').version)"
}

function getPackageVersionMinor
{
    node -e "let v = require('./package.json').version;v = v.split('.');console.log(v[0]+'.'+v[1]);"
}

function getPackageVersionMajor
{
    node -e "let v = require('./package.json').version;v = v.split('.');console.log(v[0]);"
}