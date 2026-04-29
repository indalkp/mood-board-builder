# Wix CMS Collections — required for Mood Board Builder

Create these in Wix Editor → **Content Manager → Create Collection**.

> Permissions are critical. Get them wrong and either nothing works (too restrictive)
> or your data is publicly editable (too permissive). Copy the Custom Permissions exactly.

---

## Collection 1 — MoodBoards

| Field | Type | Notes |
|-------|------|-------|
| _id | (auto, system) | Wix default |
| _owner | (auto, system) | Wix default — auto-fills with member ID |
| _createdDate | (auto, system) | Wix default |
| _updatedDate | (auto, system) | Wix default |
| name | Text | Required |
| shareSlug | Text | Required, indexed (Wix calls this "set as ID-like") |
| isPublic | Boolean | Default: false |

### Permissions → "Custom permissions"
- **Read content**: Site member author
- **Add content**: Site member
- **Update content**: Site member author
- **Delete content**: Site member author

(All public reads happen through the Velo backend with suppressAuth: true.)

---

## Collection 2 — MoodBoardImages

| Field | Type | Notes |
|-------|------|-------|
| _id | (auto, system) | |
| _createdDate | (auto, system) | |
| boardId | Reference → MoodBoards | |
| imageUrl | Image | Wix Media Manager URL |
| order | Number | Default: 0 |

### Permissions → "Custom permissions"
- **Read content**: Site member author
- **Add content**: Site member
- **Update content**: Site member author
- **Delete content**: Site member author

(Public reads of images go through the same backend path that fetches the parent board.)

---

## Sanity check before moving on

After creating both collections, in the Wix Editor sidebar you should see:
- **Content Manager** → MoodBoards (with 0 items)
- **Content Manager** → MoodBoardImages (with 0 items)

If they appear → CMS layer ready. Move to velo/backend/moodBoardService.web.js paste step.
