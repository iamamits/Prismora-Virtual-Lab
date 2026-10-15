export type CacheAssociativity = 'direct' | '2-way' | '4-way' | 'fully';
export type ReplacementPolicy = 'LRU' | 'FIFO' | 'Random';
export type WritePolicy = 'write-through' | 'write-back';

export interface CacheLine {
  valid: boolean;
  dirty: boolean;
  tag: number;
  lastAccessTime: number;
  data: number[]; // Block data
}

export interface CacheSet {
  lines: CacheLine[];
}

export interface AddressBreakdown {
  address: number;
  binary: string;
  tag: number;
  tagBits: number;
  index: number;
  indexBits: number;
  offset: number;
  offsetBits: number;
}

export interface CacheAccessResult {
  hit: boolean;
  missType?: 'compulsory' | 'capacity' | 'conflict';
  setIndex: number;
  lineIndex: number;
  evicted: boolean;
  evictedTag?: number;
  addressBreakdown: AddressBreakdown;
}

export interface CacheStats {
  accesses: number;
  hits: number;
  misses: number;
  hitRate: number; // 0..100%
  compulsoryMisses: number;
  capacityMisses: number;
  conflictMisses: number;
}

export class CacheSimulator {
  private cacheSize: number; // In bytes (e.g. 256, 512, 1024)
  private blockSize: number; // In bytes (e.g. 16, 32, 64)
  private associativity: CacheAssociativity;
  private replacementPolicy: ReplacementPolicy;
  private writePolicy: WritePolicy;

  private numSets: number = 1;
  private waysPerSet: number = 1;
  private offsetBits: number = 4;
  private indexBits: number = 4;
  private tagBits: number = 24;

  private sets: CacheSet[] = [];
  private currentTime: number = 0;
  private stats: CacheStats = {
    accesses: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    compulsoryMisses: 0,
    capacityMisses: 0,
    conflictMisses: 0,
  };
  private seenBlocks: Set<number> = new Set();

  constructor(
    cacheSize: number = 256,
    blockSize: number = 16,
    associativity: CacheAssociativity = 'direct',
    replacementPolicy: ReplacementPolicy = 'LRU',
    writePolicy: WritePolicy = 'write-through',
  ) {
    this.cacheSize = cacheSize;
    this.blockSize = blockSize;
    this.associativity = associativity;
    this.replacementPolicy = replacementPolicy;
    this.writePolicy = writePolicy;
    this.configure();
  }

  configure(): void {
    const totalLines = Math.floor(this.cacheSize / this.blockSize);

    if (this.associativity === 'direct') {
      this.waysPerSet = 1;
      this.numSets = totalLines;
    } else if (this.associativity === '2-way') {
      this.waysPerSet = 2;
      this.numSets = Math.max(1, Math.floor(totalLines / 2));
    } else if (this.associativity === '4-way') {
      this.waysPerSet = 4;
      this.numSets = Math.max(1, Math.floor(totalLines / 4));
    } else {
      // Fully Associative
      this.waysPerSet = totalLines;
      this.numSets = 1;
    }

    this.offsetBits = Math.log2(this.blockSize);
    this.indexBits = Math.log2(this.numSets);
    this.tagBits = 32 - this.offsetBits - this.indexBits;

    // Initialize cache structures
    this.sets = [];
    for (let s = 0; s < this.numSets; s++) {
      const lines: CacheLine[] = [];
      for (let w = 0; w < this.waysPerSet; w++) {
        lines.push({
          valid: false,
          dirty: false,
          tag: 0,
          lastAccessTime: 0,
          data: new Array(this.blockSize).fill(0),
        });
      }
      this.sets.push({ lines });
    }

    this.resetStats();
  }

  resetStats(): void {
    this.stats = {
      accesses: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      compulsoryMisses: 0,
      capacityMisses: 0,
      conflictMisses: 0,
    };
    this.seenBlocks.clear();
    this.currentTime = 0;
  }

  breakdownAddress(address: number): AddressBreakdown {
    const uAddr = address >>> 0;
    const offsetMask = (1 << this.offsetBits) - 1;
    const offset = uAddr & offsetMask;

    const indexMask = (1 << this.indexBits) - 1;
    const index = (uAddr >>> this.offsetBits) & indexMask;

    const tag = uAddr >>> (this.offsetBits + this.indexBits);

    return {
      address: uAddr,
      binary: uAddr.toString(2).padStart(32, '0'),
      tag,
      tagBits: this.tagBits,
      index,
      indexBits: this.indexBits,
      offset,
      offsetBits: this.offsetBits,
    };
  }

  access(address: number, isWrite: boolean = false): CacheAccessResult {
    this.currentTime++;
    this.stats.accesses++;

    const breakdown = this.breakdownAddress(address);
    const blockAddr = address >>> this.offsetBits;
    const isFirstTimeSeen = !this.seenBlocks.has(blockAddr);
    this.seenBlocks.add(blockAddr);

    const set = this.sets[breakdown.index]!;
    let hitIndex = -1;

    // Search lines in set for matching tag
    for (let i = 0; i < set.lines.length; i++) {
      const line = set.lines[i]!;
      if (line.valid && line.tag === breakdown.tag) {
        hitIndex = i;
        break;
      }
    }

    if (hitIndex !== -1) {
      // HIT!
      this.stats.hits++;
      const line = set.lines[hitIndex]!;
      line.lastAccessTime = this.currentTime;
      if (isWrite && this.writePolicy === 'write-back') {
        line.dirty = true;
      }
      this.updateHitRate();

      return {
        hit: true,
        setIndex: breakdown.index,
        lineIndex: hitIndex,
        evicted: false,
        addressBreakdown: breakdown,
      };
    }

    // MISS!
    this.stats.misses++;
    let missType: 'compulsory' | 'capacity' | 'conflict' = 'compulsory';

    if (isFirstTimeSeen) {
      missType = 'compulsory';
      this.stats.compulsoryMisses++;
    } else if (this.associativity === 'fully') {
      missType = 'capacity';
      this.stats.capacityMisses++;
    } else {
      missType = 'conflict';
      this.stats.conflictMisses++;
    }

    // Select replacement line
    // Find empty (invalid) line first
    let replaceIndex = set.lines.findIndex((l) => !l.valid);
    let evicted = false;
    let evictedTag: number | undefined;

    if (replaceIndex === -1) {
      // All lines valid: apply replacement policy
      evicted = true;
      if (this.replacementPolicy === 'LRU') {
        let oldestTime = Infinity;
        for (let i = 0; i < set.lines.length; i++) {
          if (set.lines[i]!.lastAccessTime < oldestTime) {
            oldestTime = set.lines[i]!.lastAccessTime;
            replaceIndex = i;
          }
        }
      } else {
        replaceIndex = 0;
      }
      evictedTag = set.lines[replaceIndex]!.tag;
    }

    const targetLine = set.lines[replaceIndex]!;
    targetLine.valid = true;
    targetLine.dirty = isWrite && this.writePolicy === 'write-back';
    targetLine.tag = breakdown.tag;
    targetLine.lastAccessTime = this.currentTime;

    this.updateHitRate();

    return {
      hit: false,
      missType,
      setIndex: breakdown.index,
      lineIndex: replaceIndex,
      evicted,
      evictedTag,
      addressBreakdown: breakdown,
    };
  }

  private updateHitRate(): void {
    this.stats.hitRate =
      this.stats.accesses > 0
        ? Number(((this.stats.hits / this.stats.accesses) * 100).toFixed(1))
        : 0;
  }

  getSets(): readonly CacheSet[] {
    return this.sets;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }
}
