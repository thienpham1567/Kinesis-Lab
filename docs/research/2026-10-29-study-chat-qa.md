# Contextual floating chat QA — 2026-10-29

Implemented user-approved scope: reader-controlled scrolling, icon copy, contextual research questions, selected Atlas structure context, app navigation from answers, and persistent searchable knowledge/history. Kept existing Kinesis sheet/cobalt controls and model selection. No deployment performed.

## Sources and context

The client publishes selected structure ID, bilingual name, side, area and conservative training-group membership. The server accepts only the stable ID, resolves corrected metadata itself and creates real Atlas/training URLs. Unmounting/deselecting Atlas clears live context. Each answer retains its own context so switching the selection does not relabel historical responses.

Floating study requests bypass curriculum RAG. Existing scoped source records and PubMed metadata/abstracts supply the model context; checked dates and reading scopes remain truthful. Short selected-structure follow-ups exclude previous-muscle retrieval topics. Explicit comparisons include the existing individual records for up to two known muscle families. Unselected follow-ups may use bounded local topic history, while explicit current topics supersede previous ones. Public search never receives raw questions or history.

Real runtime QA found bare “Deltoid” searches returned ankle deltoid-ligament papers. The revised trusted query preserves the muscle/tissue noun (e.g. `"Deltoid muscle"[Title/Abstract]`) and fixed question facets. A bounded title/abstract family-phrase filter excludes ligament-only results before exposure to the model or source UI. Direct NCBI verification retained muscle mentions and excluded the ankle-ligament examples. This establishes name relevance, not support for every claim or clinical validation. The response still must cite actual supplied sources, distinguish subpart/family scope and acknowledge gaps. Existing medical policy and symptom referral rules remain.

## Browser checks

- Real Atlas selection of right acromial deltoid updated the chat chip and research-question subject. A short follow-up used that same selected structure and supplied source metadata.
- Real streamed answer completed; source cards exposed actual URLs, access scopes and dates. Response copy worked and the clipboard contained readable references without internal APP/PMID markers.
- Saved answers were found using unaccented Vietnamese, survived reload, and retained source/context/action metadata. History restored the conversation.
- A separate localhost proxy served the actual production UI with explicitly synthetic streaming responses to verify scroll behavior without model timing dependence. During an 80-chunk stream, scrolling up set `scrollTop=1458`; content height grew from 3354 to 4342 while scrollTop remained 1458. “Có nội dung mới” then returned distance-from-bottom to 0.
- At 390 × 844, chat, search/library and composer fit the viewport. The current action closed the chat and navigated to the selected structure at `#atlas-3d-stage`, exposing the target model rather than covering it. Escape closed the panel and restored focus to the launcher.
- Temporary viewport override was reset. Proxy/production QA processes are stopped after testing. Native mobile keyboard behavior was not simulated by the desktop viewport check.

## Automated verification

- `npm run check:study-chat`: 21 passing checks covering current context, history/comparison source selection, trusted PubMed query/relevance, safe URLs, storage validation/roundtrip/eviction/search, citation copy and scroll decisions.
- `npm run check:chat`: 24 passing runtime/stream/import/RAG/route tests plus evidence coverage over 1,115 records. Updated the coverage harness to load the new real route dependency; no assertions were removed.
- Targeted ESLint and `git diff --check`: passed.
- Production build and TypeScript: passed. Existing unrelated `metadataBase` warning remains.
- React Doctor: no issues reported in changed tracked files (score 86/100); manual review additionally covered the new files.
- Independent implementation review identified context-group, comparison/history, copy-boundary and storage-pressure issues; fixes were reviewed and approved.

Local screenshots: `output/study-chat-qa/context-and-actions.png`, `output/study-chat-qa/library-mobile.png`.

## Persistence limits

Library is local to this browser/origin, not synchronized to the cloud. Automatic history keeps up to 30 conversations, 60 messages each, evicting oldest histories under the 2-million-character application budget. Up to 100 explicit bookmarks are retained; a full bookmark library reports an error instead of silently dropping the oldest saved answer. Storage/clipboard errors are surfaced. Clearing browser site data removes local history/bookmarks.
