#!/bin/bash
set -o pipefail

BRANCH_NAME=$1

# delete the oldest branch if there are more than 250 branches
if [ $(npx neonctl branch list --output json --api-key ${NEON_API_KEY} --project-id ${NEON_PROJECT_ID} 2>/dev/null | jq length) -eq 250 ]; then
    OLDEST_PREVIEW_BRANCH=$(npx neonctl branches list --output json --api-key ${NEON_API_KEY} --project-id ${NEON_PROJECT_ID} 2>/dev/null | \
    jq -r '[.[] | select(.name | startswith("preview"))] | sort_by(.created_at) | .[0].name')
    npx neonctl branch delete $OLDEST_PREVIEW_BRANCH --api-key ${NEON_API_KEY} --project-id ${NEON_PROJECT_ID} > /dev/null || { echo "Error: Failed to delete oldest preview branch" >&2; exit 1; }
fi

# create the branch if it doesn't exist
npx neonctl branch get $BRANCH_NAME --api-key ${NEON_API_KEY} --project-id ${NEON_PROJECT_ID} > /dev/null 2>&1
if [ $? -ne 0 ]; then
    npx neonctl branch create --name $BRANCH_NAME --api-key ${NEON_API_KEY} --project-id ${NEON_PROJECT_ID} --parent preview > /dev/null || { echo "Error: Failed to create preview branch" >&2; exit 1; }
fi

# get branch connection string
CONNECTION_STRING=$(npx neonctl connection-string ${BRANCH_NAME} --api-key ${NEON_API_KEY} --project-id ${NEON_PROJECT_ID} 2>/dev/null)
export DATABASE_URL=$CONNECTION_STRING

# apply the migration with prisma, and seed data
npx prisma db push --force-reset > /dev/null || { echo "Error: Prisma db push failed" >&2; exit 1; }
npx prisma db seed > /dev/null || { echo "Error: Prisma db seed failed" >&2; exit 1; }

# return the connection string
echo $CONNECTION_STRING
