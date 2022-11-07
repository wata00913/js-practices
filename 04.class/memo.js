const crypto = require("crypto");
const fs = require("fs");
const { Select } = require("enquirer");

class Memo {
  constructor({ id, content = "" }) {
    this._id = id ?? crypto.randomUUID();
    this._content = content;
  }

  create() {
    const all = Memo.all();
    all.push(this);

    fs.writeFileSync(Memo.PATH, JSON.stringify({ all: all }));
  }

  find(id) {
    const all = Memo.all();
    return all.find((data) => data.id === id);
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
      return new this({ id: data._id, content: data._content });
    });
  }

  static get PATH() {
    return "./data.json";
  }

  get content() {
    return this._content;
  }

  set content(val) {
    this._content = val;
  }

  get id() {
    return this._id;
  }
}

function parseOptions() {
  return require("minimist")(process.argv.slice(2), {
    default: {
      l: false,
      r: false,
      d: false,
    },
  });
}

function displayMemoPrompt(memos, opts, afterAction = () => {}) {
  const prompt = new Select({
    name: "memo",
    message: opts.message,
    footer() {
      return opts.isShowDetail ? memos[this.state.index].content : "";
    },
    choices() {
      return memos.map((memo) => memo.content.split("\n")[0]);
    },
    result() {
      afterAction(memos[this.state.index]);
    },
  });

  prompt.run().then().catch(console.error);
}

if (process.stdin.isTTY) {
  const opts = parseOptions();
  const memos = Memo.all();
  if (opts.l) {
    memos.forEach((memo) => {
      console.log(memo.content.split("\n")[0]);
    });
  } else if (opts.r) {
    const promptOpts = {
      isShowDetail: true,
      message: "Choose a note you want to see:",
    };
    displayMemoPrompt(memos, promptOpts);
  } else if (opts.d) {
    const promptOpts = {
      isShowDetail: false,
      message: "Choose a note you want to delete:",
    };
    displayMemoPrompt(memos, promptOpts, (memo) => {
      memo.destroy();
      console.log("Deleted memo");
    });
  }
} else {
  const content = fs.readFileSync("/dev/stdin", "utf8");
  const memo = new Memo({ content: content });
  memo.create();
}
