import fs from "fs";
import got from "got";
import tsm from "ts-morph";

async function main() {
  const project = new tsm.Project({
    tsConfigFilePath: "./tsconfig.definition.json",
  });
  try {
    const response = await got(
      "https://raw.githubusercontent.com/TheQwertiest/foo_spider_monkey_panel/master/component/docs/js/foo_spider_monkey_panel.js"
    );
    const src = project.createSourceFile(
      "foo_spider_monkey_panel.js",
      response.body
    );
    const langserv = project.getLanguageService();
    const action = langserv.getCombinedCodeFix(
      src,
      "convertFunctionToEs6Class"
    );
    const changes = action.getChanges();

    let i = 0;
    for (const change of changes) {
      change.applyChanges();
      const output = src.getEmitOutput({ emitOnlyDtsFiles: true });
      for (const outputFile of output.getOutputFiles()) {
        fs.writeFileSync(`output${i}.d.ts`, outputFile.getText());
      }
    }
  } catch (error) {
    console.error(error);
    if (error.response != null) {
      console.error(error.response.body);
    }
  }
}

main();
