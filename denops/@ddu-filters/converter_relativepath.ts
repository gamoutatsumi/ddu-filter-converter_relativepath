import {
  BaseFilter,
  BaseFilterParams,
  DduItem,
} from "https://deno.land/x/ddu_vim@v3.10.2/types.ts";
import { fn } from "https://deno.land/x/ddu_vim@v3.10.2/deps.ts";
import {
  isAbsolute,
  relative,
} from "https://deno.land/std@0.214.0/path/mod.ts";
import { is } from "https://deno.land/x/unknownutil@v3.15.0/mod.ts";
import { FilterArguments } from "https://deno.land/x/ddu_vim@v3.10.2/base/filter.ts";

function getPath(item: DduItem): string | undefined {
  if (is.ObjectOf({ action: is.ObjectOf({ path: is.String }) })(item)) {
    return item.action.path;
  }
}

export class Filter extends BaseFilter<BaseFilterParams> {
  async filter(
    { items, denops }: FilterArguments<BaseFilterParams>,
  ): Promise<DduItem[]> {
    const cwd = await fn.getcwd(denops);
    return Promise.resolve(items.map((item) => {
      const path = getPath(item);
      if (path === undefined || !isAbsolute(path)) {
        return item;
      }
      const { word, display = word, matcherKey } = item;
      if (display !== path) {
        return item;
      }

      const relPath = relative(cwd, display);

      if (matcherKey === path) {
        item.matcherKey = relPath;
      }
      item.word = relPath;
      item.display = relPath;

      return item;
    }));
  }
  params() {
    return {};
  }
}
