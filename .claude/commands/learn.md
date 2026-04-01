# Update Knowledge

Add or update a knowledge node in the graph based on something learned during development.

## Usage

The user describes what they learned: `/project:learn We're using cursor-based pagination with Supabase`

## Steps

1. Read existing knowledge nodes to find where this belongs:

```bash
find .knowledge -name "*.md" -exec head -1 {} \; -print
```

2. Determine if this should:
   - **Update** an existing node (e.g., adding pagination details to api-conventions.md)
   - **Create** a new node (e.g., a new domain concept or research finding)

3. If updating, read the existing file and add the new information in the appropriate section. Preserve all existing content and links.

4. If creating, place it in the right category folder and add `## Related` links to connected nodes. Also update those connected nodes to link back.

5. Keep nodes focused. If a node is growing past 150 lines, suggest splitting it.

6. Print what changed and which stories might be affected (search for nodes that reference the updated file).
