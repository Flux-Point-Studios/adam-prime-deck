import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSpend, slideFromHash, nextSlide } from '../src/model.mjs';

const policy = { amount: 30, perTransaction: 50, windowCap: 100, used: 40, principal: 500, floor: 250, revoked: false };

test('permits an illustrative outflow within all quantity limits', () => {
  assert.deepEqual(assessSpend(policy), { allowed: true, reason: 'Within all illustrated limits', remaining: 30 });
});

test('rejects each distinct spending boundary', () => {
  for (const [change, reason] of [
    [{ amount: 51 }, 'Per-transaction cap exceeded'],
    [{ amount: 45, used: 60 }, 'Rolling-window cap exceeded'],
    [{ principal: 270 }, 'Principal floor would be breached'],
    [{ revoked: true }, 'Owner revoked agent access'],
    [{ amount: -1 }, 'Enter a valid quantity'],
    [{ amount: NaN }, 'Enter a valid quantity'],
  ]) {
    const result = assessSpend({ ...policy, ...change });
    assert.equal(result.allowed, false);
    assert.equal(result.reason, reason);
  }
});

test('permits exact caps and refuses any amount after revocation', () => {
  assert.equal(assessSpend({ ...policy, amount: 50, used: 50 }).allowed, true);
  assert.equal(assessSpend({ ...policy, amount: 0, revoked: true }).allowed, false);
});

test('deep links and navigation remain within the deck', () => {
  assert.equal(slideFromHash('#5', 10), 4);
  for (const hash of ['#0', '#11', '#garbage', '#2x', '']) assert.equal(slideFromHash(hash, 10), 0);
  assert.equal(nextSlide(0, -1, 10), 0);
  assert.equal(nextSlide(9, 1, 10), 9);
  assert.equal(nextSlide(2, 1, 10), 3);
});
