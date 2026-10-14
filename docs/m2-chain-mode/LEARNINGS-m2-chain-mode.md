# LEARNINGS: Opt-in M2 chain mode

## 1. Result

Yumo now has an opt-in `pdlc dev <REQ> --delivery-mode chain --accepted-issue <URL>` route. It checks the accepted handoff inputs, creates and gates later SDLC artifacts once, then keeps implementation, tests, DoD, and PR/CI delivery. It reports `chain-validated` without implying cross-review approval. The default `pdlc dev` path remains available. Chain mode leaves the verified PR open for operator review.

## 2. Decision source

[Yumo issue #89](https://github.com/ohenak/yumo-plugins/issues/89) and its [workflow correction](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6173830868), [operator selection](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6173895373), [exact branch-head CI decision](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6173951462), and [DoD/PR decision](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6174183309) remain the requirement and design record. These local artifacts record implementation evidence and trace back to that issue.

## 3. Bounded review lesson

Two stopped `pdlc dev` attempts entered Phase R cross-review and widened the accepted CI-only consumer scope before implementation. Chain mode uses an explicit accepted-issue handoff and one artifact gate per stage, so a repeated review loop does not silently reopen requirements. Its deterministic gates check nonempty artifacts, the accepted issue URL in issue decisions, and FSPEC REQ-ID agreement. They do not replace human review of design quality or issue meaning.

## 4. Verification

The workflow test run reported **178/178 suites**, **5,397 passing tests**, and **70 skipped**. The engine test run reported **975 passing tests** and **2 skipped**. The bundle check passed. These results verify the Yumo change in this worktree; the external regime-ledger PR, its current-head CI result, and live report evidence remain separate M2 exit tests.

## 5. Harvested row

| Source | Learning | Follow-up |
| --- | --- | --- |
| Accepted [issue #89 handoff and correction](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6173830868) | An accepted issue needs a bounded route through the SDLC; repeated specification cross-review can expand an already settled feature. | Use chain mode for the accepted consumer handoff and record its PR, exact-head push-run CI, bounded repair, and redacted report gates in the corresponding issues. |
