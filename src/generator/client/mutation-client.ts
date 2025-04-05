/**
 * Generate the mutation client, with all its methods
 */

import { capitalize } from "../../utils/capitalize.js";
import { getTypeName } from "../utils/type-name.js";
import { generateTypeComment } from "../utils/generate-comment.js";
import type { GraphQLSchema } from "graphql";

const wrapperCode = `
import { sendRequest } from "../runtime/send-request.js";
import { buildMutationString } from "../runtime/build-mutation.js";
import type { GraphQLApiResponse, GraphQLFlowClientConfig, MutationArgs, OperationReturnType } from "../runtime/types.js";

import type * as SelectionTypes from "../types/selection-types.js";
import type * as MutationInputs from "../types/mutation-inputs.js";
import type * as BaseTypes from "../types/base-types.js";

export class GraphQLFlowMutationClient {
    private readonly config;

    public constructor(config: GraphQLFlowClientConfig) {
        this.config = config;
    }

-----
}
`;

export function generateMutationClient(schema: GraphQLSchema) {
    const mutationType = schema.getMutationType();
    const generatedMutationMethods: string[] = [];

    if (!mutationType) {
        return "";
    }

    const allMutations = mutationType.getFields();

    for (const mutation of Object.values(allMutations)) {
        const mutationName = capitalize(mutation.name);
        const mutationDescription = generateTypeComment(mutation.description);

        const mutationSelectionType = getTypeName(mutation.type, "SelectionTypes");
        const mutationReturnType = getTypeName(mutation.type, "BaseTypes");

        const generatedType = `${mutationDescription}\npublic async ${mutation.name}<TSelection extends ${mutationSelectionType}Selection>(mutationArgs: MutationArgs<MutationInputs.${mutationName}Input, TSelection>): Promise<GraphQLApiResponse<OperationReturnType<${mutationReturnType}, TSelection>>> {\nconst generatedMutation = buildMutationString("${mutation.name}", mutationArgs);\nreturn await sendRequest<OperationReturnType<${mutationReturnType}, TSelection>>(this.config, generatedMutation);\n};`;

        generatedMutationMethods.push(generatedType);
    }

    const joinedMutationMethods = generatedMutationMethods.join("\n\n");

    return wrapperCode.replace("-----", joinedMutationMethods);
}
