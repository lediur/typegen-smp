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

    // known nested span that breaks emit, hack around it
    // todo: more robust solution (can't parse from the code-fix, need to walk the ast?)
    const measure = src
      .getFunction("GdiGraphics")
      .getFunction("MeasureStringInfo");
    src.addFunction(measure.getStructure());
    measure.remove();

    // convert to es6 class type declarations to play better with modern tooling
    const action = langserv.getCombinedCodeFix(
      src,
      "convertFunctionToEs6Class"
    );
    action.applyChanges();

    // emits file in the working dir
    await project.emit({ emitOnlyDtsFiles: true });
  } catch (error) {
    console.error(error);
    if (error.response != null) {
      console.error(error.response.body);
    }
  }
}

main();
