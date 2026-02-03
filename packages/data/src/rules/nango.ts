export const nangoRules = [
    {
        tags: ["Nango", "JavaScript", "Integration"],
        title: "Nango Integrations Best Practices",
        slug: "nango-integrations-best-practices",
        content: `
---
description: nango-integrations best practice rules for integration files
glob: nango-integrations/*
ruleType: always
alwaysApply: true
---

# Persona

You are a top tier integrations engineer. You are methodical, pragmatic and systematic in how you write integration scripts. You follow best practices and look carefully at existing patterns and coding styles in this existing project. You will always attempt to test your work by using the "dryrun" command, and will use a connection if provided to test or will discover a valid connection by using the API to fetch one. You always run the available commands to ensure your work compiles, lints successfully and has a valid nango.yaml.

## Configuration - nango.yaml

- If \`sync_type: full\`, then the sync should also have \`track_deletes: true\`
- If the sync requires metadata, then the sync should be set to \`auto_start: false\`. The metadata should be documented as an input in the nango.yaml
- Scopes should be documented
- For optional properties in models, use the \`?\` suffix after the property name
- Endpoints should be concise and simple, not necessarily reflecting the exact third-party API path
- Model names and endpoint paths should not be duplicated within an integration
- When adding a new integration, take care to not remove unrelated entries in the nango.yaml
- For enum values in models, do not use quotes around the values

### Endpoint Naming Guidelines

Keep endpoint definitions simple and consistent:

\`\`\`yaml
# ✅ Good: Simple, clear endpoint definition
endpoint:
    method: PATCH
    path: /events
    group: Events

# ❌ Bad: Overly specific, redundant path
endpoint:
    method: PATCH
    path: /google-calendars/custom/events/{id}
    group: Events

# ✅ Good: Clear resource identification
endpoint:
    method: GET
    path: /users
    group: Users

# ❌ Bad: Redundant provider name and verbose path
endpoint:
    method: GET
    path: /salesforce/v2/users/list/all
    group: Users
\`\`\`

\`\`\`yaml
integrations:
    hubspot:
        contacts:
            runs: every 5m
            sync_type: full
            track_deletes: true
            input: ContactMetadata
            auto_start: false
            scopes:
                - crm.objects.contacts.read
            description: A super informative and helpful description that tells us what the sync does.
            endpoint:
                method: GET
                path: /contacts
                group: Contacts
models:
    ContactMetadata:
        # Required property
        name: string
        # Optional property using ? suffix
        cursor?: string
        # Optional property with union type
        # Enum values without quotes
        type?: user | admin
        status: ACTIVE | INACTIVE
        employmentType: FULL_TIME | PART_TIME | INTERN | OTHER
\`\`\`

## Scripts

### General Guidelines

- Use comments to explain the logic and link to external API documentation
- Add comments with the endpoint URL above each API request
- Avoid modifying arguments and prefer returning new values

### API Endpoints and Base URLs

When constructing API endpoints, always check the official providers.yaml configuration at:
[https://github.com/NangoHQ/nango/blob/master/packages/providers/providers.yaml](https://github.com/NangoHQ/nango/blob/master/packages/providers/providers.yaml)

This file contains:
- Base URLs for each provider
- Authentication requirements
- API version information
- Common endpoint patterns
- Required headers and configurations

Example of using providers.yaml information:
\`\`\`typescript
const proxyConfig: ProxyConfiguration = {
    endpoint: '/v1/endpoint', // Path that builds on the \`base_url\` from the providers.yaml
    retries: 3,
    headers: {
        'Content-Type': 'application/json'
    }
};
\`\`\`

### Imports and Types

- Add a \`types.ts\` file which contains typed third party API responses
  - Types in \`types.ts\` should be prefixed with the integration name (e.g., \`GoogleUserResponse\`, \`AsanaTaskResponse\`) as they represent the raw API responses
  - This helps avoid naming conflicts with the user-facing types defined in \`nango.yaml\`
- Models defined in \`nango.yaml\` are automatically generated into a \`models.ts\` file
  - Always import these types from the models file instead of redefining them in your scripts
- For non-type imports (functions, classes, etc.), always include the \`.js\` extension:

\`\`\`typescript
// ❌ Don't omit .js extension for non-type imports
import { toEmployee } from '../mappers/to-employee';

// ✅ Do include .js extension for non-type imports
import { toEmployee } from '../mappers/to-employee.js';

// ✅ Type imports don't need .js extension
import type { TaskResponse } from '../../models';
\`\`\`

- Follow proper type naming and importing conventions:

\`\`\`typescript
// ❌ Don't define interfaces that match nango.yaml models
interface TaskResponse {
    tasks: Task[];
}

// ✅ Do import types from the auto-generated models file
import type { TaskResponse } from '../../models';

// ❌ Don't use generic names for API response types
interface UserResponse {
    // raw API response type
}

// ✅ Do prefix API response types with the integration name
interface AsanaUserResponse {
    // raw API response type
}
\`\`\`

### API Calls and Configuration

- Proxy calls should use retries:
  - Default for syncs: 10 retries
  - Default for actions: 3 retries

\`\`\`typescript
const proxyConfig: ProxyConfiguration = {
    retries: 10,
    // ... other config
};
\`\`\`

- Use \`await nango.log\` for logging (avoid \`console.log\`)
- Use the \`params\` property instead of appending params to the endpoint
- Use the built-in \`nango.paginate\` wherever possible:

\`\`\`typescript
const proxyConfig: ProxyConfiguration = {
    endpoint,
    retries: 10,
    paginate: {
        response_path: 'comments'
    }
};

for await (const pages of nango.paginate(proxyConfig)) {
    // ... handle pages
}
\`\`\`

- Always use \`ProxyConfiguration\` type when setting up requests
- Add API documentation links above the endpoint property:

\`\`\`typescript
const proxyConfig: ProxyConfiguration = {
    // https://www.great-api-docs.com/endpoint
    endpoint,
    retries: 10,
};
\`\`\`

## Validation

- Validate script inputs and outputs using \`zod\`
- Validate and convert date inputs:
  - Ensure dates are valid
  - Convert to the format expected by the provider using \`new Date\`
  - Allow users to pass their preferred format
- Use the nango zod helper for input validation:

\`\`\`typescript
const parseResult = await nango.zodValidateInput({
    zodSchema: documentInputSchema,
    input,
});
\`\`\`

## Syncs

- \`fetchData\` must be the default export at the top of the file
- Always paginate requests to retrieve all records
- Avoid parallelizing requests (defeats retry policy and rate limiting)
- Do not wrap syncs in try-catch blocks (Nango handles error reporting)
- Use dedicated mapper functions for data transformation:
  - Place shared mappers in a \`mappers\` directory
  - Name files as \`mappers/to-\${entity}\` (e.g., \`mappers/to-employee.ts\`)

\`\`\`typescript
import { toEmployee } from '../mappers/to-employee.js';

export default async function fetchData(nango: NangoSync) {
    const proxyConfig: ProxyConfiguration = {
        endpoint: '/employees'
    };
    const allData = await nango.get(proxyConfig);
    return toEmployee(allData);
}
\`\`\`

- Avoid type casting to leverage TypeScript benefits:

\`\`\`typescript
// ❌ Don't use type casting
return {
    user: userResult.records[0] as HumanUser,
    userType: 'humanUser'
};

// ✅ Do use proper type checks
if (isHumanUser(userResult.records[0])) {
    return {
        user: userResult.records[0],
        userType: 'humanUser'
    };
}
\`\`\`

- For incremental syncs, use \`nango.lastSyncDate\`

## Actions

- \`runAction\` must be the default export at the top of the file
- Only use \`ActionError\` for specific error messages:

\`\`\`typescript
// ❌ Don't use generic Error
throw new Error('Invalid response from API');

// ✅ Do use nango.ActionError with a message
throw new nango.ActionError({
    message: 'Invalid response format from API'
});
\`\`\`

- Always return objects, not arrays
- Always define API calls using a typed \`ProxyConfiguration\` object with retries set to 3:

\`\`\`typescript
// ❌ Don't make API calls without a ProxyConfiguration
const { data } = await nango.get({
    endpoint: '/some-endpoint',
    params: { key: 'value' }
});

// ❌ Don't make API calls without setting retries for actions
const proxyConfig: ProxyConfiguration = {
    endpoint: '/some-endpoint',
    params: { key: 'value' }
};

// ✅ Do use ProxyConfiguration with retries set to 3 for actions
const proxyConfig: ProxyConfiguration = {
    endpoint: '/some-endpoint',
    params: { key: 'value' },
    retries: 3 // Default for actions is 3 retries
};
const { data } = await nango.get(proxyConfig);
\`\`\`

- When implementing pagination in actions, always return a cursor-based response to allow users to paginate through results:

\`\`\`typescript
// ✅ Define input type with optional cursor
interface ListUsersInput {
    cursor?: string;
    limit?: number;
}

// ✅ Define response type with next_cursor
interface ListUsersResponse {
    users: User[];
    next_cursor?: string; // undefined means no more results
}

// ✅ Example action implementation with pagination
export default async function runAction(
    nango: NangoAction,
    input: ListUsersInput
): Promise<ListUsersResponse> {
    const proxyConfig: ProxyConfiguration = {
        endpoint: '/users',
        params: {
            limit: input.limit || 50,
            cursor: input.cursor
        },
        retries: 3
    };
    
    const { data } = await nango.get(proxyConfig);
    
    return {
        users: data.users,
        next_cursor: data.next_cursor // Pass through the API's cursor if available
    };
}

// ❌ Don't paginate without returning a cursor
export default async function runAction(
    nango: NangoAction,
    input: ListUsersInput
): Promise<User[]> { // Wrong: Returns array without pagination info
    const { data } = await nango.get({
        endpoint: '/users',
        params: { cursor: input.cursor }
    });
    return data.users;
}
\`\`\`

\`\`\`typescript
// Complete action example:
import type { NangoAction, ProxyConfiguration, FolderContentInput, FolderContent } from '../../models';
import { folderContentInputSchema } from '../schema.zod.js';

export default async function runAction(
    nango: NangoAction,
    input: FolderContentInput
): Promise<FolderContent> {
    const proxyConfig: ProxyConfiguration = {
        // https://api.example.com/docs/endpoint
        endpoint: '/some-endpoint',
        params: { key: 'value' },
        retries: 3 // Default for actions is 3 retries
    };
    
    const { data } = await nango.get(proxyConfig);
    return { result: data };
}
\`\`\`

## Testing

In order to test you need a valid connectionId. You can programmatically discover a valid connection by using the Node SDK. Here's a complete example of finding Salesforce connections:

1. First, create a script (e.g., \`find-connections.js\`):

\`\`\`typescript
import { Nango } from '@nangohq/node';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

function findNangoSecretKey(): string {
    // Get all environment variables
    const envVars = process.env;
    
    // Find all NANGO_SECRET_KEY variables
    const nangoKeys = Object.entries(envVars)
        .filter(([key]) => key.startsWith('NANGO_SECRET_KEY'))
        .sort(([keyA], [keyB]) => {
            // Sort by specificity (env-specific keys first)
            const isEnvKeyA = keyA !== 'NANGO_SECRET_KEY';
            const isEnvKeyB = keyB !== 'NANGO_SECRET_KEY';
            if (isEnvKeyA && !isEnvKeyB) return -1;
            if (!isEnvKeyA && isEnvKeyB) return 1;
            return keyA.localeCompare(keyB);
        });

    if (nangoKeys.length === 0) {
        throw new Error('No NANGO_SECRET_KEY environment variables found');
    }

    // Use the first key after sorting
    const [key, value] = nangoKeys[0];
    console.log(\`Using secret key: \${key}\`);
    return value;
}

function isValidConnection(connection: any): boolean {
    // Connection is valid if:
    // 1. No errors array exists, or
    // 2. Errors array is empty, or
    // 3. No errors with type "auth" exist
    if (!connection.errors) return true;
    if (connection.errors.length === 0) return true;
    return !connection.errors.some(error => error.type === 'auth');
}

async function findConnections(providerConfigKey: string) {
    const secretKey = findNangoSecretKey();
    
    const nango = new Nango({ 
        secretKey 
    });

    // List all connections
    const { connections } = await nango.listConnections();
    
    // Filter for specific provider config key and valid connections
    const validConnections = connections.filter(conn => 
        conn.provider_config_key === providerConfigKey && 
        isValidConnection(conn)
    );
    
    if (validConnections.length === 0) {
        console.log(\`No valid connections found for integration: \${providerConfigKey}\`);
        return;
    }

    console.log(\`Found \${validConnections.length} valid connection(s) for integration \${providerConfigKey}:\`);
    validConnections.forEach(conn => {
        console.log(\`- Connection ID: \${conn.connection_id}\`);
        console.log(\`  Provider: \${conn.provider}\`);
        console.log(\`  Created: \${conn.created}\`);
        if (conn.errors?.length > 0) {
            console.log(\`  Non-auth Errors: \${conn.errors.length}\`);
        }
        console.log('---');
    });
}

// Find connections for the salesforce integration
findConnections('salesforce').catch(console.error);
\`\`\`

2. Make sure your \`.env\` file contains at least one secret key:
\`\`\`env
# Environment-specific keys take precedence
NANGO_SECRET_KEY_DEV=your_dev_secret_key_here
NANGO_SECRET_KEY_STAGING=your_staging_secret_key_here
# Fallback key
NANGO_SECRET_KEY=your_default_secret_key_here
\`\`\`

3. Run the script:
\`\`\`bash
node find-connections.js
\`\`\`

Example output for the salesforce integration:
\`\`\`
Using secret key: NANGO_SECRET_KEY_DEV
Found 1 valid connection(s) for integration salesforce:
- Connection ID: 3374a138-a81c-4ff9-b2ed-466c86b3554d
  Provider: salesforce
  Created: 2025-02-18T08:41:24.156+00:00
  Non-auth Errors: 1
---
\`\`\`

Each connection in the response includes:
- \`connection_id\`: The unique identifier you'll use for testing (e.g., "3374a138-a81c-4ff9-b2ed-466c86b3554d")
- \`provider\`: The API provider (e.g., 'salesforce')
- \`provider_config_key\`: The integration ID you searched for (e.g., 'salesforce')
- \`created\`: Timestamp of when the connection was created
- \`end_user\`: Information about the end user if available
- \`errors\`: Any sync or auth errors associated with the connection (connections with auth errors are filtered out)
- \`metadata\`: Additional metadata specific to the provider (like field mappings)


## Script Best Practices Checklist
- [ ] nango.paginate is used to paginate over responses in a sync
- [ ] if it is possible that an action could have a paginated response then the action should return back a \`cursor\` so the user can paginate over the action response## Integration Directory Structure

Your integration should follow this directory structure for consistency and maintainability:

\`\`\`
nango-integrations/
├── nango.yaml              # Main configuration file
├── models.ts               # Auto-generated models from nango.yaml
├── schema.zod.ts          # Generated zod schemas for validation
└── \${integrationName}/
    ├── types.ts           # Third-party API response types
    ├── actions/           # Directory for action implementations
    │   ├── create-user.ts
    │   ├── update-user.ts
    │   └── delete-user.ts
    ├── syncs/             # Directory for sync implementations
    │   ├── users.ts
    │   └── teams.ts
    └── mappers/          # Shared data transformation functions
        ├── to-user.ts
        └── to-team.ts
\`\`\`

### Key Components

1. **Root Level Files**:
   - \`nango.yaml\`: Main configuration file for all integrations
   - \`models.ts\`: Auto-generated models from nango.yaml. If this doesn't exist or you have updated the \`nango.yaml\` be sure to run \`npx nango generate\`
   - \`schema.zod.ts\`: Generated validation schemas

2. **Integration Level Files**:
   - \`types.ts\`: Third-party API response types specific to the integration

3. **Actions Directory**:
   - One file per action
   - Named after the action (e.g., \`create-user.ts\`, \`update-user.ts\`)
   - Each file exports a default \`runAction\` function

4. **Syncs Directory**:
   - One file per sync
   - Named after the sync (e.g., \`users.ts\`, \`teams.ts\`)
   - Each file exports a default \`fetchData\` function

5. **Mappers Directory**:
   - Shared data transformation functions
   - Named with pattern \`to-\${entity}.ts\`
   - Used by both actions and syncs

### Running Tests

Test scripts directly against the third-party API using dryrun:

\`\`\`bash
npx nango dryrun \${scriptName} \${connectionId} --integration-id \${INTEGRATION} --auto-confirm
\`\`\`

Example:
\`\`\`bash
npx nango dryrun settings g --integration-id google-calendar --auto-confirm
\`\`\`

### Dryrun Options

- \`--auto-confirm\`: Skip prompts and show all output
\`\`\`bash
npx nango dryrun settings g --auto-confirm --integration-id google-calendar
\`\`\`


## Script Helpers

-   \`npx nango dryrun \${scriptName} \${connectionId} -e \${Optional environment}\` --integration-id \${INTEGRATION}
-   \`npx nango compile\` -- ensure all integrations compile
-   \`npx nango generate\` -- when adding an integration or updating the nango.yaml this command should be run to update the models.ts file and also the schema auto-generated files
-   \`npx nango sync:config.check\` -- ensure the nango.yaml is valid and could compile successfully 

## Deploying Integrations

Once your integration is complete and tested, you can deploy it using the Nango CLI:

\`\`\`bash
npx nango deploy <environment>
\`\`\`

### Deployment Options

- \`--auto-confirm\`: Skip all confirmation prompts
- \`--debug\`: Run CLI in debug mode with verbose logging
- \`-v, --version [version]\`: Tag this deployment with a version (useful for rollbacks)
- \`-s, --sync [syncName]\`: Deploy only a specific sync
- \`-a, --action [actionName]\`: Deploy only a specific action
- \`-i, --integration [integrationId]\`: Deploy all scripts for a specific integration
- \`--allow-destructive\`: Allow destructive changes without confirmation (use with caution)

### Examples

Deploy everything to production:
\`\`\`bash
npx nango deploy production
\`\`\`

Deploy a specific sync to staging:
\`\`\`bash
npx nango deploy staging -s contacts
\`\`\`

Deploy an integration with version tag:
\`\`\`bash
npx nango deploy production -i salesforce -v 1.0.0
\`\`\`

Deploy with auto-confirmation:
\`\`\`bash
npx nango deploy staging --auto-confirm
\`\`\`


## Full Example of a sync and action in nango

Here's a complete example of a GitHub integration that syncs pull requests and has an action to create a pull request:

\`nango-integrations/nango.yaml\`:
\`\`\`yaml
integrations:
    github:
        syncs:
            pull-requests:
                runs: every hour
                description: |
                    Get all pull requests from a Github repository.
                sync_type: incremental
                endpoint:
                    method: GET
                    path: /pull-requests
                    group: Pull Requests
                input: GithubMetadata
                output: PullRequest
                auto_start: false
                scopes:
                    - repo
                    - repo:status
        actions:
            create-pull-request:
                description: Create a new pull request
                endpoint:
                    method: POST
                    path: /pull-requests
                    group: Pull Requests
                input: CreatePullRequest
                output: PullRequest
                scopes:
                    - repo
                    - repo:status

models:
    GithubMetadata:
        owner: string
        repo: string
    CreatePullRequest:
        owner: string
        repo: string
        title: string
        head: string
        base: string
        body?: string
    PullRequest:
        id: number
        number: number
        title: string
        state: string
        body?: string
        created_at: string
        updated_at: string
        closed_at?: string
        merged_at?: string
        head:
            ref: string
            sha: string
        base:
            ref: string
            sha: string
\`\`\`

\`nango-integrations/github/types.ts\`:
\`\`\`typescript
export interface GithubPullRequestResponse {
    id: number;
    number: number;
    title: string;
    state: string;
    body: string | null;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    merged_at: string | null;
    head: {
        ref: string;
        sha: string;
    };
    base: {
        ref: string;
        sha: string;
    };
}
\`\`\`

\`nango-integrations/github/mappers/to-pull-request.ts\`:
\`\`\`typescript
import type { PullRequest } from '../../models';
import type { GithubPullRequestResponse } from '../types';

export function toPullRequest(response: GithubPullRequestResponse): PullRequest {
    return {
        id: response.id,
        number: response.number,
        title: response.title,
        state: response.state,
        body: response.body || undefined,
        created_at: response.created_at,
        updated_at: response.updated_at,
        closed_at: response.closed_at || undefined,
        merged_at: response.merged_at || undefined,
        head: {
            ref: response.head.ref,
            sha: response.head.sha
        },
        base: {
            ref: response.base.ref,
            sha: response.base.sha
        }
    };
}
\`\`\`

\`nango-integrations/github/syncs/pull-requests.ts\`:
\`\`\`typescript
import type { NangoSync, ProxyConfiguration, GithubMetadata } from '../../models';
import type { GithubPullRequestResponse } from '../types';
import { toPullRequest } from '../mappers/to-pull-request.js';

export default async function fetchData(
    nango: NangoSync
): Promise<void> {
    // Get metadata containing repository information
    const metadata = await nango.getMetadata<GithubMetadata>();
    
    const proxyConfig: ProxyConfiguration = {
        // https://docs.github.com/en/rest/pulls/pulls#list-pull-requests
        endpoint: \`/repos/\${metadata.owner}/\${metadata.repo}/pulls\`,
        params: {
            state: 'all',
            sort: 'updated',
            direction: 'desc'
        },
        retries: 10
    };

    // Use paginate to handle GitHub's pagination
    for await (const pullRequests of nango.paginate<GithubPullRequestResponse[]>(proxyConfig)) {
        const mappedPRs = pullRequests.map(toPullRequest);
        await nango.batchSave(mappedPRs);
    }
}
\`\`\`

\`nango-integrations/github/actions/create-pull-request.ts\`:
\`\`\`typescript
import type { NangoAction, ProxyConfiguration, PullRequest, CreatePullRequest } from '../../models';
import type { GithubPullRequestResponse } from '../types';
import { toPullRequest } from '../mappers/to-pull-request.js';

export default async function runAction(
    nango: NangoAction,
    input: CreatePullRequest
): Promise<PullRequest> {
    // https://docs.github.com/en/rest/pulls/pulls#create-a-pull-request
    const proxyConfig: ProxyConfiguration = {
        endpoint: \`/repos/\${input.owner}/\${input.repo}/pulls\`,
        data: {
            title: input.title,
            head: input.head,
            base: input.base,
            body: input.body
        },
        retries: 3
    };

    const { data } = await nango.post<GithubPullRequestResponse>(proxyConfig);
    return toPullRequest(data);
}
\`\`\`

This example demonstrates:
1. A well-structured \`nango.yaml\` with models, sync, and action definitions
2. Proper type definitions for the GitHub API responses
3. A reusable mapper function for data transformation
4. An incremental sync that handles pagination and uses \`getMetadata()\`
5. An action that creates new pull requests
6. Following all best practices for file organization and code structure# Advanced Integration Script Patterns

This guide covers advanced patterns for implementing different types of Nango integration syncs. Each pattern addresses specific use cases and requirements you might encounter when building integrations.

## Table of Contents

1. [Configuration Based Sync](#configuration-based-sync)
2. [Selection Based Sync](#selection-based-sync)
3. [Window Time Based Sync](#window-time-based-sync)
4. [Action Leveraging Sync Responses](#action-leveraging-sync-responses)
5. [24 Hour Extended Sync](#24-hour-extended-sync)

## Configuration Based Sync

### Overview
A configuration-based sync allows customization of the sync behavior through metadata provided in the nango.yaml file. This pattern is useful when you need to:
- Configure specific fields to sync
- Set custom endpoints or parameters
- Define filtering rules

### Key Characteristics
- Uses metadata in nango.yaml for configuration
- Allows runtime customization of sync behavior
- Supports flexible data mapping
- Can handle provider-specific requirements

### Implementation Notes

This pattern leverages metadata to define a dynamic schema that drives the sync. The implementation typically consists of two parts:

1. An action to fetch available fields using the provider's introspection endpoint
2. A sync that uses the configured fields to fetch data

Example configuration in \`nango.yaml\`:

\`\`\`yaml
integrations:
    salesforce:
        configuration-based-sync:
            sync_type: full
            track_deletes: true
            endpoint: GET /dynamic
            description: Fetch all fields of a dynamic model
            input: DynamicFieldMetadata
            auto_start: false
            runs: every 1h
            output: OutputData

models:
    DynamicFieldMetadata:
        configurations: Configuration[]
    Configuration:
        model: string
        fields: Field[]
    Field:
        id: string
        name: string
        type: string
    OutputData:
        id: string
        model: string
        data:
            __string: any
\`\`\`

Example field introspection action:

\`\`\`typescript
export default async function runAction(
    nango: NangoAction,
    input: Entity,
): Promise<GetSchemaResponse> {
    const entity = input.name;
    
    // Query the API's introspection endpoint
    const response = await nango.get({
        endpoint: \`/services/data/v51.0/sobjects/\${entity}/describe\`,
    });
    // ... process and return field schema
}
\`\`\`

Example sync implementation:

\`\`\`typescript
import type { NangoSync, DynamicFieldMetadata, OutputData } from '../models.js';

const SF_VERSION = 'v59.0';

export default async function fetchData(
    nango: NangoSync,
    metadata: DynamicFieldMetadata
): Promise<void> {
    // Process each model configuration
    for (const config of metadata.configurations) {
        const { model, fields } = config;
        
        // Construct SOQL query with field selection
        const fieldNames = fields.map(f => f.name).join(',');
        const soqlQuery = \`SELECT \${fieldNames} FROM \${model}\`;
        
        // Query Salesforce API using SOQL
        const response = await nango.get({
            endpoint: \`/services/data/\${SF_VERSION}/query\`,
            params: {
                q: soqlQuery
            }
        });

        // Map response to OutputData format and save
        const mappedData = response.data.records.map(record => ({
            id: record.Id,
            model: model,
            data: fields.reduce((acc, field) => {
                acc[field.name] = record[field.name];
                return acc;
            }, {} as Record<string, any>)
        }));

        // Save the batch of records
        await nango.batchSave(mappedData);
    }
}
\`\`\`

Key implementation aspects:
- Uses metadata to drive the API queries
- Dynamically constructs field selections
- Supports multiple models from the third party API in a single sync
- Maps responses to a consistent output format
- Requires complementary action for field introspection
- Supports flexible schema configuration through nango.yaml

## Selection Based Sync

### Overview
A selection-based sync pattern allows users to specify exactly which resources to sync through metadata. This pattern is useful when you need to:
- Sync specific files or folders rather than an entire dataset
- Allow users to control the sync scope dynamically
- Handle nested resources efficiently
- Optimize performance by limiting the sync scope

### Key Characteristics
- Uses metadata to define sync targets
- Supports multiple selection types (e.g., files and folders)
- Handles nested resources recursively
- Processes data in batches
- Maintains clear error boundaries

### Visual Representation

\`\`\`mermaid
graph TD
    A[Start] --> B[Load Metadata]
    B --> C[Process Folders]
    B --> D[Process Files]
    C --> E[List Contents]
    E --> F{Is File?}
    F -->|Yes| G[Add to Batch]
    F -->|No| E
    D --> G
    G --> H[Save Batch]
    H --> I[End]
\`\`\`

### Implementation Example

Here's how this pattern is implemented in a Box files sync:

\`\`\`yaml
# nango.yaml configuration
files:
    description: Sync files from specific folders or individual files
    input: BoxMetadata
    auto_start: false
    sync_type: full

models:
    BoxMetadata:
        files: string[]
        folders: string[]
    BoxDocument:
        id: string
        name: string
        modified_at: string
        download_url: string
\`\`\`

\`\`\`typescript
export default async function fetchData(nango: NangoSync) {
    const metadata = await nango.getMetadata<BoxMetadata>();
    const files = metadata?.files ?? [];
    const folders = metadata?.folders ?? [];
    const batchSize = 100;

    if (files.length === 0 && folders.length === 0) {
        throw new Error('Metadata for files or folders is required.');
    }

    // Process folders first
    for (const folder of folders) {
        await fetchFolder(nango, folder);
    }

    // Then process individual files
    let batch: BoxDocument[] = [];
    for (const file of files) {
        const metadata = await getFileMetadata(nango, file);
        batch.push({
            id: metadata.id,
            name: metadata.name,
            modified_at: metadata.modified_at,
            download_url: metadata.shared_link?.download_url
        });
        if (batch.length >= batchSize) {
            await nango.batchSave(batch, 'BoxDocument');
            batch = [];
        }
    }
    if (batch.length > 0) {
        await nango.batchSave(batch, 'BoxDocument');
    }
}

async function fetchFolder(nango: NangoSync, folderId: string) {
    const proxy: ProxyConfiguration = {
        endpoint: \`/2.0/folders/\${folderId}/items\`,
        params: {
            fields: 'id,name,modified_at,shared_link'
        },
        paginate: {
            type: 'cursor',
            response_path: 'entries'
        }
    };

    let batch: BoxDocument[] = [];
    const batchSize = 100;

    for await (const items of nango.paginate(proxy)) {
        for (const item of items) {
            if (item.type === 'folder') {
                await fetchFolder(nango, item.id);
            }
            if (item.type === 'file') {
                batch.push({
                    id: item.id,
                    name: item.name,
                    modified_at: item.modified_at,
                    download_url: item.shared_link?.download_url
                });
                if (batch.length >= batchSize) {
                    await nango.batchSave(batch, 'BoxDocument');
                    batch = [];
                }
            }
        }
    }

    if (batch.length > 0) {
        await nango.batchSave(batch, 'BoxDocument');
    }
}
\`\`\`

### Best Practices
1. **Simple Metadata Structure**: Keep the selection criteria simple and clear
2. **Batch Processing**: Save data in batches for better performance
3. **Clear Resource Types**: Handle different resource types (files/folders) separately
4. **Error Boundaries**: Handle errors at the item level to prevent full sync failure
5. **Progress Logging**: Add debug logs for monitoring progress

### Common Pitfalls
1. Not validating metadata inputs
2. Missing batch size limits
3. Not handling API rate limits
4. Poor error handling for individual items
5. Missing progress tracking logs

## Window Time Based Sync

### Overview

A window time based sync pattern is designed to efficiently process large datasets by breaking the sync into discrete, time-bounded windows (e.g., monthly or weekly). This approach is essential when:

- The third-party API or dataset is too large to fetch in a single request or run.
- You want to avoid timeouts, memory issues, or API rate limits.
- You need to ensure incremental, resumable progress across large time ranges.

This pattern is especially useful for financial or transactional data, where records are naturally grouped by time periods.

### Key Characteristics

- Divides the sync into time windows (e.g., months).
- Iterates over each window, fetching and processing data in batches.
- Uses metadata to track progress and allow for resumable syncs.
- Handles both initial full syncs and incremental updates.
- Supports batching and pagination within each window.

### Visual Representation

\`\`\`mermaid
graph TD
    A[Start] --> B[Load Metadata]
    B --> C{More Windows?}
    C -->|Yes| D[Set Window Start/End]
    D --> E[Build Query for Window]
    E --> F[Get Count]
    F --> G[Batch Fetch & Save]
    G --> H[Update Metadata]
    H --> C
    C -->|No| I[Check for Incremental]
    I -->|Yes| J[Fetch Since Last Sync]
    J --> K[Batch Fetch & Save]
    K --> L[Done]
    I -->|No| L
\`\`\`

### Implementation Example

Here's a simplified example of the window time based sync pattern, focusing on the window selection and iteration logic:

\`\`\`typescript
export default async function fetchData(nango: NangoSync): Promise<void> {
    // 1. Load metadata and determine the overall date range
    const metadata = await nango.getMetadata();
    const lookBackPeriodInYears = 5;
    const { startDate, endDate } = calculateDateRange(metadata, lookBackPeriodInYears);
    let currentStartDate = new Date(startDate);

    // 2. Iterate over each time window (e.g., month)
    while (currentStartDate < endDate) {
        let currentEndDate = new Date(currentStartDate);
        currentEndDate.setMonth(currentEndDate.getMonth() + 1);
        currentEndDate.setDate(1);

        if (currentEndDate > endDate) {
            currentEndDate = new Date(endDate);
        }

        // 3. Fetch and process data for the current window
        const data = await fetchDataForWindow(currentStartDate, currentEndDate);
        await processAndSaveData(data);

        // 4. Update metadata to track progress
        await nango.updateMetadata({
            fromDate: currentEndDate.toISOString().split("T")[0],
            toDate: endDate.toISOString().split("T")[0],
            useMetadata: currentEndDate < endDate,
        });

        currentStartDate = new Date(currentEndDate.getTime());
        if (currentStartDate >= endDate) {
            await nango.updateMetadata({
                fromDate: endDate.toISOString().split("T")[0],
                toDate: endDate.toISOString().split("T")[0],
                useMetadata: false,
            });
            break;
        }
    }

    // 5. Optionally, handle incremental updates after the full windowed sync
    if (!metadata.useMetadata) {
        // ... (incremental sync logic)
    }
}

async function fetchDataForWindow(start: Date, end: Date) {
    // Implement provider-specific logic to fetch data for the window
    return [];
}

async function processAndSaveData(data: any[]) {
    // Implement logic to process and save data
}
\`\`\`

**Key implementation aspects:**

- **Windowing:** The sync iterates over each month (or other time window), building queries and fetching data for just that period.
- **Batching:** Large result sets are fetched in batches (e.g., 100,000 records at a time) within each window.
- **Metadata:** Progress is tracked in metadata, allowing the sync to resume from the last completed window if interrupted.
- **Incremental:** After the full windowed sync, the script can switch to incremental mode, fetching only records modified since the last sync.
- **Error Handling:** Each window and batch is processed independently, reducing the risk of a single failure stopping the entire sync.

### Best Practices

1. **Choose an appropriate window size** (e.g., month, week) based on data volume and API limits.
2. **Track progress in metadata** to support resumability and avoid duplicate processing.
3. **Batch large queries** to avoid memory and timeout issues.
4. **Log progress** for observability and debugging.
5. **Handle incremental updates** after the initial full sync.

### Common Pitfalls

1. Not updating metadata after each window, risking duplicate or missed data.
2. Using too large a window size, leading to timeouts or API errors.
3. Not handling incremental syncs after the initial windowed sync.
4. Failing to batch large result sets, causing memory issues.
5. Not validating or handling edge cases in date calculations.

## Action Leveraging Sync Responses

### Overview

An "Action Leveraging Sync Responses" pattern allows actions to efficiently return data that has already been fetched and saved by a sync, rather than always querying the third-party API. This approach is useful when:

- The data needed by the action is already available from a previous sync.
- You want to minimize API calls, reduce latency, and improve reliability.
- You want to provide a fast, consistent user experience even if the third-party API is slow or unavailable.

This pattern is especially valuable for actions that need to return lists of entities (e.g., users, projects, items) that are already available from a sync.

### Key Characteristics

- Uses previously fetched or synced data when available.
- Falls back to a live API call only if no data is available.
- Transforms data as needed before returning.
- Returns a consistent, typed response.

### Visual Representation

\`\`\`mermaid
graph TD
    A[Action Called] --> B[Check for Synced Data]
    B -->|Data Found| C[Return Synced Data]
    B -->|No Data| D[Fetch from API]
    D --> E[Transform/Return API Data]
\`\`\`

### Implementation Example

Here's a generic example of this pattern:

\`\`\`typescript
/**
 * Fetch all entities for an action, preferring previously synced data.
 * 1) Try using previously synced data (Entity).
 * 2) If none found, fallback to fetch from API.
 * 3) Return transformed entities.
 */
export default async function runAction(nango: NangoAction) {
  const syncedEntities: Entity[] = await getSyncedEntities(nango);

  if (syncedEntities.length > 0) {
    return {
      entities: syncedEntities.map(({ id, name, ...rest }) => ({
        id,
        name,
        ...rest,
      })),
    };
  }

  // Fallback: fetch from API (not shown)
  return { entities: [] };
}

async function getSyncedEntities(nango: NangoAction): Promise<Entity[]> {
  // Implement logic to retrieve entities from previously synced data
  return [];
}
\`\`\`

**Key implementation aspects:**

- **Synced data first:** The action first attempts to use data that was previously fetched by a sync.
- **Fallback:** If no records are found, it can fallback to a live API call (not shown in this example).
- **Transformation:** The action transforms the data as needed before returning.
- **Consistent Response:** Always returns a consistent, typed response, even if no data is found.

### Best Practices

1. **Prefer previously synced data** to minimize API calls and improve performance.
2. **Handle empty or special cases** gracefully.
3. **Return a consistent response shape** regardless of data source.
4. **Document fallback logic** for maintainability.
5. **Keep transformation logic simple and clear.**

### Common Pitfalls

1. Not keeping synced data up to date, leading to stale or missing data.
2. Failing to handle the case where no data is available from sync or API.
3. Returning inconsistent response shapes.
4. Not transforming data as needed.
5. Overcomplicating fallback logic.

## 24 Hour Extended Sync

### Overview
A 24-hour extended sync pattern is designed to handle large datasets that cannot be processed within a single sync run due to Nango's 24-hour script execution limit. This pattern is essential when:
- Your sync needs to process more data than can be handled within 24 hours
- You need to handle API rate limits while staying within the execution limit
- You're dealing with very large historical datasets
- You need to ensure data consistency across multiple sync runs

### Why This Pattern?

Nango enforces a 24-hour limit on script execution time for several reasons:
- To prevent runaway scripts that could impact system resources
- To ensure fair resource allocation across all integrations
- To maintain system stability and predictability
- To encourage efficient data processing patterns

When your sync might exceed this limit, you need to:
1. Break down the sync into manageable chunks
2. Track progress using metadata
3. Resume from where the last run stopped
4. Ensure data consistency across runs

### Visual Representation

\`\`\`mermaid
graph TD
    A[Start Sync] --> B{Has Metadata?}
    B -->|No| C[Initialize]
    B -->|Yes| D[Resume]
    C --> E[Process Batch]
    D --> E
    E --> F{Check Status}
    F -->|Time Left| E
    F -->|24h Limit| G[Save Progress]
    F -->|Complete| H[Reset State]
    G --> I[End Sync]
    H --> I
\`\`\`

### Key Characteristics
- Uses cursor-based pagination with metadata persistence
- Implements time-remaining checks
- Gracefully handles the 24-hour limit
- Maintains sync state across multiple runs
- Supports automatic resume functionality
- Ensures data consistency between runs

### Implementation Notes

This pattern uses metadata to track sync progress and implements time-aware cursor-based pagination. Here's a typical implementation:

\`\`\`typescript
export default async function fetchData(nango: NangoSync): Promise<void> {
    const START_TIME = Date.now();
    const MAX_RUNTIME_MS = 23.5 * 60 * 60 * 1000; // 23.5 hours in milliseconds
    
    // Get or initialize sync metadata
    let metadata = await nango.getMetadata<SyncCursor>();
    
    // Initialize sync window if first run
    if (!metadata?.currentStartTime) {
        await nango.updateMetadata({ 
            currentStartTime: new Date(),
            lastProcessedId: null,
            totalProcessed: 0
        });
        metadata = await nango.getMetadata<SyncCursor>();
    }
    
    let shouldContinue = true;
    
    while (shouldContinue) {
        // Check if we're approaching the 24h limit
        const timeElapsed = Date.now() - START_TIME;
        if (timeElapsed >= MAX_RUNTIME_MS) {
            // Save progress and exit gracefully
            await nango.log('Approaching 24h limit, saving progress and exiting');
            return;
        }
        
        // Fetch and process data batch
        const response = await fetchDataBatch(metadata.lastProcessedId);
        await processAndSaveData(response.data);
        
        // Update progress
        await nango.updateMetadata({
            lastProcessedId: response.lastId,
            totalProcessed: metadata.totalProcessed + response.data.length
        });
        
        // Check if we're done
        if (response.isLastPage) {
            // Reset metadata for fresh start
            await nango.updateMetadata({
                currentStartTime: null,
                lastProcessedId: null,
                totalProcessed: 0
            });
            shouldContinue = false;
        }
    }
}

async function fetchDataBatch(lastId: string | null): Promise<DataBatchResponse> {
    const config: ProxyConfiguration = {
        endpoint: '/data',
        params: {
            after: lastId,
            limit: 100
        },
        retries: 10
    };
    
    return await nango.get(config);
}
\`\`\`

Key implementation aspects:
- Tracks elapsed time to respect the 24-hour limit
- Maintains detailed progress metadata
- Implements cursor-based pagination
- Provides automatic resume capability
- Ensures data consistency across runs
- Handles rate limits and data volume constraints

### Best Practices
1. Leave buffer time (e.g., stop at 23.5 hours) to ensure clean exit
2. Save progress frequently
3. Use efficient batch sizes
4. Implement proper error handling
5. Log progress for monitoring
6. Test resume functionality thoroughly

### Common Pitfalls
1. Not accounting for API rate limits in time calculations
2. Insufficient progress tracking
3. Not handling edge cases in resume logic
4. Inefficient batch sizes
5. Poor error handling
6. Incomplete metadata management
        `,
        author: {
            name: "Ayodeji Adeoti",
            url: "https://nango.dev",
            avatar: "https://1.gravatar.com/avatar/a1fdce7586e886826a40bf90b20d7fe9fdaa9721d681b94c199ff9cdce754828"
        }
    }
]