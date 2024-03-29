"use strict";
import { Stats, InstructionStatsEntry } from "./stats";

export interface StatEntry {
  replication: number;
  stats: object;
}

export class StatsAgregator {
  private _stats: Array<Stats> = new Array();

  constructor() {}

  public agragate(stats: Stats) {
    this._stats.push(stats);
  }

  public export(): Array<StatEntry> {
    let result = [];

    for (let i = 0; i < this._stats.length; i++) {
      result.push({
        replication: i,
        stats: this._stats[i].exportStats(),
      });
    }

    return result;
  }

  public getAvgUnitsUsage(): Map<string, number[]> {
    let result = new Map();

    for (let stat of this._stats) {
      let usages = stat.getUnitsUsage();
      for (let key of usages.keys()) {
        if (!result.has(key)) {
          result.set(key, []);
        }
        result.get(key).push(usages.get(key));
      }
    }

    for (let key of result.keys()) {
      result.set(key, this.avgOfArrays(result.get(key)));
    }

    return result;
  }

  public getAvgCommitedAndDiscarded(): { commited: number; discarded: number } {
    let commited = 0;
    let discarded = 0;

    for (let stat of this._stats) {
      let stats = stat.getCommitedAndDiscarded();
      commited += stats.commited;
      discarded += stats.discarded;
    }

    return {
      commited: commited / this._stats.length,
      discarded: discarded / this._stats.length,
    };
  }

  public getAvgCommitedPercentagePerInstruction(): Map<number, number> {
    let result = new Map<number, number>();

    for (let stat of this._stats) {
      let stats = stat.getCommitedPercentagePerInstruction();
      for (let [key, value] of stats) {
        if (!result.has(key)) {
          result.set(key, 0);
        }
        result.set(key, result.get(key) + value);
      }
    }

    for (let [key, value] of result) {
      result.set(key, value / this._stats.length);
    }

    return result;
  }

  public getAvgInstructionsStatusesAverage(): Map<
    number,
    InstructionStatsEntry
  > {
    let result = new Map<number, InstructionStatsEntry>();

    for (let stat of this._stats) {
      let stats = stat.getInstructionsStatusesAverage();
      for (let [key, value] of stats) {
        if (!result.has(key)) {
          result.set(key, value);
        } else {
          //iterate over the properties of the object
          for (let prop in value) {
            if (value.hasOwnProperty(prop)) {
              result.get(key)[prop] += value[prop];
            }
          }
        }
      }
    }

    for (let [, value] of result) {
      for (let prop in value) {
        if (value.hasOwnProperty(prop)) {
          value[prop] = value[prop] / this._stats.length;
        }
      }
    }

    return result;
  }

  public getPerStatusCountAtCycle(): Map<string, number[]> {
    let result = new Map();

    for (let stat of this._stats) {
      let stats = stat.getPerStatusCountAtCycle();
      for (let key of stats.keys()) {
        if (!result.has(key)) {
          result.set(key, []);
        }
        result.get(key).push(stats.get(key));
      }
    }

    for (let key of result.keys()) {
      result.set(key, this.avgOfArrays(result.get(key)));
    }

    return result;
  }

  private avgOfArrays(arr: number[][]): number[] {
    let result = [];
    let maxlen = arr.reduce((max, arr) => Math.max(max, arr.length), 0);
    for (let i = 0; i < maxlen; i++) {
      let sum = 0;
      for (let j = 0; j < arr.length; j++) {
        if (i >= arr[j].length) {
          continue;
        }

        sum += arr[j][i];
      }
      result.push(sum / arr.length);
    }
    return result;
  }
}
