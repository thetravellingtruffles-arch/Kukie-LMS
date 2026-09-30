// Deterministic seeded RNG so sample data is stable across server renders.
export function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private rand: () => number;
  constructor(seed: number) {
    this.rand = mulberry32(seed);
  }
  next() {
    return this.rand();
  }
  int(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  float(min: number, max: number, digits = 2) {
    const v = this.next() * (max - min) + min;
    return Number(v.toFixed(digits));
  }
  bool(pTrue = 0.5) {
    return this.next() < pTrue;
  }
  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }
  pickWeighted<T>(items: { value: T; weight: number }[]): T {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let r = this.next() * total;
    for (const item of items) {
      if (r < item.weight) return item.value;
      r -= item.weight;
    }
    return items[items.length - 1].value;
  }
  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  daysAgo(days: number) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }
}
