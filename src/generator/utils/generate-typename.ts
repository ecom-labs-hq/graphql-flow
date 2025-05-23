/**
 * Generate the __typename field
 */

export function generateTypename(fieldName: string): string {
    return `{ baseType: "${fieldName}", returnType: "${fieldName}", arguments: never, isArray: false, itemsAreNullable: true, isNullable: false }`;
}
