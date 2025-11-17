# CODE REVISION PROTOCOL - MANDATORY RULES

**Effective Date:** November 17, 2024
**Authority:** User directive - ABSOLUTE COMPLIANCE REQUIRED

---

## ABSOLUTE PROHIBITIONS

### 1. NO PATCHING - ONLY FIXING
- ❌ **FORBIDDEN:** Running Python scripts that use string replacement to "patch" code
- ❌ **FORBIDDEN:** Using search/replace on code blocks
- ✅ **REQUIRED:** Read the actual lines of code with errors
- ✅ **REQUIRED:** Use Edit tool to fix the EXACT lines with proper code
- ✅ **REQUIRED:** Fix the root cause, not symptoms

### 2. NO CODE DELETION WITHOUT PERMISSION
- ❌ **FORBIDDEN:** Deleting ANY code without express written permission from user
- ✅ **REQUIRED:** Only ADD code (error handling, null checks, fixes)
- ✅ **REQUIRED:** Only MODIFY existing code to correct errors
- ✅ **REQUIRED:** Ask permission before removing even a single line

### 3. NO HALLUCINATIONS - 100% HONESTY REQUIRED
- ❌ **FORBIDDEN:** Guessing what code does
- ❌ **FORBIDDEN:** Assuming a fix worked without verification
- ❌ **FORBIDDEN:** Cherry-picking lines - must read complete context
- ✅ **REQUIRED:** Read EVERY line of affected code blocks
- ✅ **REQUIRED:** Attest that you actually read each line (not scanned)
- ✅ **REQUIRED:** Verify fixes were actually applied to the file

### 4. 100% TESTING REQUIRED
- ❌ **FORBIDDEN:** Marking work complete without testing
- ✅ **REQUIRED:** Test EVERY code revision
- ✅ **REQUIRED:** Read back the file after editing to verify changes
- ✅ **REQUIRED:** Check for syntax errors
- ✅ **REQUIRED:** Verify all dependencies are accessible

---

## MANDATORY CODE REVISION PROCESS

### Step 1: COMPLETE ANALYSIS (NO SKIPPING)
1. Read the ENTIRE file with Read tool (all lines, no limits)
2. Identify EXACT line numbers with errors
3. Read surrounding context (20 lines before and after)
4. Understand the actual cause (not symptoms)
5. Document findings before touching code

### Step 2: ATTESTATION BEFORE FIXING
Before making ANY code change, attest:
```
I ATTEST:
- [ ] I read lines X through Y completely (every single line)
- [ ] I understand the actual error (not guessing)
- [ ] I know the exact fix required (not patching)
- [ ] I will NOT delete any code
- [ ] I will verify the fix after applying it
```

### Step 3: PRECISE FIXING (ONE FIX AT A TIME)
1. Use Edit tool with EXACT old_string and new_string
2. Fix ONE error at a time (not multiple)
3. Ensure old_string matches EXACTLY (no typos)
4. Write proper code in new_string (not patches)
5. Commit after EACH fix with descriptive message

### Step 4: VERIFICATION (MANDATORY)
After EVERY Edit:
1. Read back the exact lines that were changed
2. Verify the fix was applied correctly
3. Check for syntax errors in the change
4. Verify no code was accidentally deleted
5. Attest that verification was completed

### Step 5: TESTING
1. Identify how to test the specific fix
2. Describe what should happen if fix is correct
3. Describe what will happen if fix failed
4. Actually perform the test or guide user to test
5. Document test results

---

## ATTESTATION TEMPLATE (USE FOR EVERY CODE CHANGE)

```markdown
## CODE REVISION ATTESTATION

**File:** [full path]
**Lines Changed:** [exact line numbers]
**Date:** [timestamp]

### PRE-CHANGE ATTESTATION
- [x] Read complete file (all X lines)
- [x] Read error context (lines X-Y)
- [x] Identified root cause: [specific cause]
- [x] Planned fix: [exact fix description]
- [x] Verified no code deletion required
- [x] Old code matches exactly: YES/NO

### CHANGE MADE
**Old Code (lines X-Y):**
```
[exact old code]
```

**New Code (lines X-Y):**
```
[exact new code]
```

**Change Type:** [Fix/Addition/Modification]
**Deletion?:** NO (or YES with permission quote)

### POST-CHANGE VERIFICATION
- [x] Re-read changed lines
- [x] Fix applied correctly: YES/NO
- [x] No syntax errors: YES/NO
- [x] No code deleted: YES/NO
- [x] Dependencies accessible: YES/NO

### TESTING
- **Test method:** [how to test]
- **Expected result:** [what should happen]
- **Actual result:** [what actually happened]
- **Status:** PASS/FAIL

### HONESTY DECLARATION
I declare 100% honesty in this attestation. I actually read every line mentioned. I did not hallucinate, guess, or assume. This fix addresses the root cause.

**Signature:** Claude Code
**Timestamp:** [ISO timestamp]
```

---

## VIOLATION CONSEQUENCES

If these rules are violated:
1. User will immediately call out the violation
2. All work must stop
3. Full audit of all changes in session required
4. Revert any changes made improperly
5. Start over with proper protocol

---

## EXAMPLES

### ❌ WRONG WAY (FORBIDDEN)
```python
# BAD: Patching with script
content = content.replace(old_function, new_function)
```
**Why wrong:** Didn't read actual code, just pattern matching

### ✅ RIGHT WAY (REQUIRED)
```markdown
1. Read file completely (1147 lines)
2. Found error at line 713: currentProperty.id accessed when null
3. Read context lines 700-730
4. Root cause: currentProperty starts as null, no null check
5. Fix: Add null check and use index instead
6. Use Edit tool with exact old/new strings
7. Verify fix applied
8. Test: Load page and check console
```

---

## QUESTIONS TO ASK BEFORE EVERY CODE CHANGE

1. Did I read the COMPLETE file?
2. Do I understand the ACTUAL error (not guessing)?
3. Am I FIXING the code (not patching)?
4. Will I DELETE any code? (If yes, get permission)
5. How will I VERIFY this fix worked?
6. How will I TEST this fix?
7. Am I being 100% HONEST?

---

**This protocol is MANDATORY and ABSOLUTE.**
**Violations are unacceptable.**
**User trust requires 100% compliance.**

---

*Generated: 2024-11-17*
*Authority: User directive*
*Compliance: MANDATORY*
