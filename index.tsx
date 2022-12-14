import { getModule } from "@rikka/API/webpack";
import RikkaPlugin from "@rikka/Common/entities/Plugin";
import { patch, rkUnpatchFunction } from "@rikka/API/patcher";
import { ContextMenu } from "@rikka/API/components";
import { SettingsCategory } from "@rikka/API/settings";
import * as React from "react";
import manifest from "./manifest.json";

export default class rkCopyRaw extends RikkaPlugin {
  private contextMenu: any;

  private unpatchMenu?: rkUnpatchFunction;

  private settingsCategory = new SettingsCategory("Copy Raw", "rk-copyRaw", this.settings);

  inject() {
    $rk.settingsManager.registerSetting("rk-copyRaw", this.settingsCategory);
    this.patchContextMenu();
  }

  private async patchContextMenu(): Promise<any> {
    // Checking here since it can cause issues if the plugin is disabled before the patch is applied
    if (!this.enabled) return;

    this.contextMenu = (await getModule(
      (m: any) => m.default?.displayName === "MessageContextMenu",
    )) as any;

    if (!this.contextMenu) { return setTimeout(() => this.patchContextMenu(), 1000); }

    this.unpatchMenu = patch(
      this.contextMenu,
      "default",
      (args: any[], res: any) => {
        res.props.children.push(
          <>
            <ContextMenu.Separator />
            <ContextMenu.Group>
              <ContextMenu.Item
                label={"Copy Raw data"}
                id="copy-raw-data"
                action={async () => {
                  DiscordNative.clipboard.copy(
                    JSON.stringify(args[0].message),
                  );
                }}
              />
            </ContextMenu.Group>
          </>,
        );
      },
    );
  }

  uninject() {
    if (this.unpatchMenu) this.unpatchMenu();
  }
}
