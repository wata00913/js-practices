#!/usr/bin/env node
const crypto = require("crypto");
const fs = require("fs");
const { prompt } = require("enquirer");
const parseArgs = require("minimist");

class Memo {
  constructor({ id, content = "" }) {
    this.id = id ?? crypto.randomUUID();
    this.content = content;
  }

  create() {
    const all = Memo.all();
    all.push(this);

    fs.writeFileSync(Memo.PATH, JSON.stringify({ all: all }));
  }

  destroy() {
    const all = Memo.all();
    const targetIdx = all.findIndex((data) => data.id === this.id);

    if (targetIdx === -1)
      throw "Can not delete because it is new or has been deleted.";

    all.splice(targetIdx, 1);
    fs.writeFileSync(Memo.PATH, JSON.stringify({ all: all }));
  }

  static all() {
    const str = fs.readFileSync(this.PATH);
    const allData = JSON.parse(str).all;
    return allData.map((data) => {
      return new this({ id: data.id, content: data.content });
    });
  }

  static get PATH() {
    return "./data.json";
  }
}

function parseOptions() {
  return parseArgs(process.argv.slice(2), {
    default: {
      l: false,
      r: false,
      d: false,
    },
  });
}

async function displayMemoPrompt(memos, opts) {
  const question = {
    type: "select",
    name: "memo",
    message: opts.message,
    footer() {
      return opts.isShowDetail ? memos[this.state.index].content : "";
    },
    choices() {
      return memos.map((memo) => {
        return { name: memo.content.split("\n")[0], value: memo };
      });
    },
    result(name) {
      return this.map(name);
    },
  };

  return await prompt(question);
}

class MemoCommand {
  static createFromStdin() {
    if (process.stdin.isTTY) {
      console.log("no stdin");
      return;
    }

    const content = fs.readFileSync("/dev/stdin", "utf8");
    const memo = new Memo({ content: content });
    memo.create();
  }

  static showList() {
    const memos = Memo.all();

    memos.forEach((memo) => {
      console.log(memo.content.split("\n")[0]);
    });
  }

  static async showDetail() {
    const memos = Memo.all();

    if (memos.length === 0) {
      console.log("No notes");
      return;
    }

    const promptOpts = {
      isShowDetail: true,
      message: "Choose a note you want to see:",
    };
    await displayMemoPrompt(memos, promptOpts);
  }

  static async delete() {
    const memos = Memo.all();

    if (memos.length === 0) {
      console.log("No notes");
      return;
    }

    const promptOpts = {
      isShowDetail: false,
      message: "Choose a note you want to delete:",
    };

    const result = await displayMemoPrompt(memos, promptOpts);
    // 選択肢は1つなので先頭の要素を取得
    const selected = Object.values(result.memo)[0];
    try {
      selected.destroy();
      console.log("Deleted memo");
    } catch (error) {
      console.log(error);
    }
  }
}

function main() {
  const opts = parseOptions();

  if (opts.l) {
    MemoCommand.showList();
  } else if (opts.r) {
    MemoCommand.showDetail();
  } else if (opts.d) {
    MemoCommand.delete();
  } else {
    MemoCommand.createFromStdin();
  }
}

main();
