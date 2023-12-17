#!/usr/bin/env zsh
#
# This is a helper script for performing a migration to a monorepo.
#
# Things will likely not work the first time around and you'll have to tweak
# stuff which means your source repos will probably be left in a messy state.
# To get around that, the script creates a clone of the source repo and works
# from the clone dir. If you need to re-run the script, pass -f to the script
# so that it will remove the cloned repo dir and re-create it.
#
# Read migration guide here: medium.com/@dselans/migrating-to-a-monorepo-with-git-subtree-4c01e2d9c981
#
# Our desired monorepo structure:
#
# ┌── assets
# │   └── img
# ├── apps
# │   ├── cli
# │   ├── console
# │   ├── docs 
# │   └── server
# ├── docs
# │   ├── install
# │	  │	  ├── docker/*
# │   │	  └── helm/*
# │   └── quickstart
# ├── libs
# │   ├── protos
# │   ├── wasm
# │   ├── wasm-detective
# │   └── wasm-transformer
# ├── scripts
# │	  └── install.sh
# ├── LICENSE
# ├── Makefile
# └── README.md

# Dirs we should pre-create and add a .gitkeep (to allow empty dirs to be added to git)
BASE_DIRS="assets/img apps docs/deploy docs/install docs/quickstart libs scripts"

# What files to pre-create/touch -- this is purely for aesthetics :)
FILES="LICENSE README.md Makefile"

# Repos we will migrate during this run; you'll want to change these between
# runs as diff repos will need to go into a diff monorepo subdir.
# REPOS="cli console server" # apps
REPOS="protos" # libs

# Name of the target mono repo dir
MONO_DIR="mono"

# Which subdir will we migrate $REPOS into
SUB_DIR="libs"

info() {
    printf "\x1b[48;5;%sm» ${1}\e[0m\n" "99"
}

warning() {
    printf "\x1b[48;5;%sm»️ ${1}\e[0m\n" "214"
}

fatal() {
    printf "\x1b[48;5;%sm» ⚠️  ${1}\e[0m\n" "196"
    exit 1
}

initialize_monorepo() {
    mkdir -p $MONO_DIR || fatal "Could not create dir ${MONO_DIR}"
    chdir $MONO_DIR || fatal "Could not chdir to ${MONO_DIR}"
    git init || fatal "Could not init git repo ${MONO_DIR}"
    git branch -M main || fatal "Could not change branch name from master -> main in ${MONO_DIR}"

    # Pre-create dirs & .gitkeep files
    for DIR in $(echo $BASE_DIRS); do
        mkdir -p $DIR || fatal "Could not create dir ${MONO_DIR}/${DIR}"
        touch $DIR/.gitkeep || fatal "Could not create ${MONO_DIR}/${DIR}.gitkeep"
    done

    for FILE in $(echo $FILES); do
        touch $FILE || fatal "Could not create ${MONO_DIR}/${FILE}"
    done

    # You'll have to manually `git add .` and `git commit -m "Initial commit"` the pre-created dirs & files
}

# Check if target mono repo already exists
if [ -d "${MONO_DIR}" ]; then
    chdir $MONO_DIR || fatal "Could not chdir to ${MONO_DIR}"
    info "Mono repo dir ${MONO_DIR} already exists, skipping initialization..."
else
    info "Initializing mono repo dir ${MONO_DIR}..."
    initialize_monorepo
fi

# Attempt to migrate each repo; we are in $MONO_DIR at this point
for REPO in $(echo $REPOS); do
    info "Attempting to migrate repo ${REPO}..."

    # Does this dir exist?
    if [ ! -d "../${REPO}" ]; then
        warning "Repo ${REPO} does not exist, skipping migration for ${REPO}..."
        continue
    fi

    CLONE_DIR="${REPO}.clone"

    # If -f was provided, remove the clone dir first
    if [ "$1" = "-f" ]; then
        info "Force provided - removing clone dir for ${REPO}..."
        rm -rf ../$CLONE_DIR || fatal "Could not remove clone dir for ${REPO}"
    fi

    # Create a clone (if one doesn't exist)
    if [ ! -d "../${CLONE_DIR}" ]; then
        info "Cloning ${REPO} to ${CLONE_DIR} ..."
        cp -r ../$REPO ../$CLONE_DIR || fatal "Could not create clone for ${REPO}"
    fi

    # Work only in the clone dir, so we don't mess up the original.

    info "Chdir'ing to '../${CLONE_DIR}'..."
    chdir ../$CLONE_DIR || fatal "Could not chdir to ../${CLONE_DIR}, exiting..."

    info "Updating ${REPO}..."
    git stash && git checkout main && git pull || fatal "Could not get updated main for ${REPO}"

    info "Creating subdir ${SUB_DIR}/${REPO}..."
    mkdir -p $SUB_DIR/$REPO || fatal "Could not create dir ${SUB_DIR}/${REPO}"

    info "Moving ${REPO}/* into ${REPO}/${SUB_DIR}/*..."
    git mv -k * $SUB_DIR/$REPO || fatal "Error during mv -f for * ${REPO}"

    info "Moving ${REPO}/.* into ${REPO}/${SUB_DIR}/*..."
    git mv -k .* $SUB_DIR/$REPO || fatal "Error during mv -f for .* ${REPO}"

    info "Adding files to git for ${REPO}..."
    git add $SUB_DIR/$REPO || fatal "Error during git add ${REPO}"

    info "Committing ${REPO} changes..."
    git commit -m "Move ${REPO} into ${SUB_DIR}/${REPO} dir during monorepo migration" || fatal "Error during commit ${REPO}"

    # Back to main repo dir
    info "Chdir'ing to '../${MONO_DIR}'..."
    chdir ../$MONO_DIR || fatal "ERROR: Could not chdir to ../${MONO_DIR}, exiting..."

    info "Adding remote for ${REPO} to ../${REPO}..."
    git remote add -f $REPO ../$CLONE_DIR || fatal "Could not add remote for ${REPO} (clone dir '../${CLONE_DIR}')"

    info "Merging ${REPO} into main..."
    git merge $REPO/main --allow-unrelated-histories -m "Merge ${REPO} into monorepo" || fatal "Could not merge ${REPO}"

    # All done with this repo
    vared -p "Done migrating repo ${REPO}! Press [enter] to continue..." -c tmp
done

info "🎉 Migration has been completed! Good luck! 🎉"
