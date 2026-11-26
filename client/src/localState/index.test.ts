import { LocalStorage } from "node-localstorage";
import { assert, describe, it } from "vitest";

import { deleteLocation } from "src/testUtil";
import { LocalState } from "./index";
import { CONFIG_KEY } from "./storageInit";

const LOCAL_STORAGE_PATH = "./wavesmp-localstorage-cache";

describe("waves-client-local-state", () => {
  let localStorage;
  let localState;

  it("Check unknown keys are cleaned up. Override defaults", async () => {
    localStorage = new LocalStorage(LOCAL_STORAGE_PATH);
    localStorage.setItem("unknownKey", "cleanme");
    const config = {
      unknownStateKey: "cleanmetoo",
      columns: ["Name", "State", "Time"],
      rowsPerPage: 5,
      lastIdp: "",
      machineId: 1010,
      theme: "testTheme",
      volume: 1.0,
    };
    const expectedConfig = {
      columns: ["Name", "State", "Time"],
      rowsPerPage: 5,
      lastIdp: "",
      theme: "testTheme",
      volume: 1.0,
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));

    localState = new LocalState(localStorage);

    assert.strictEqual(localStorage.length, 1);
    assert.strictEqual(localStorage.key(0), CONFIG_KEY);
    assert.deepEqual(
      JSON.parse(localStorage.getItem(CONFIG_KEY) ?? ""),
      expectedConfig,
    );

    const localStateKeys = await localState.keys();
    assert.lengthOf(localStateKeys, 5);
    const actualColumns = await localState.getItem("columns");
    assert.deepEqual(actualColumns, expectedConfig.columns);
    const actualRowsPerPage = await localState.getItem("rowsPerPage");
    assert.strictEqual(actualRowsPerPage, expectedConfig.rowsPerPage);
    const actualLastIdp = await localState.getItem("lastIdp");
    assert.strictEqual(actualLastIdp, expectedConfig.lastIdp);
    const actualTheme = await localState.getItem("theme");
    assert.strictEqual(actualTheme, expectedConfig.theme);
    const actualVolume = await localState.getItem("volume");
    assert.strictEqual(actualVolume, expectedConfig.volume);

    deleteLocation(localStorage);
  });

  it("Check defaults, then update", async () => {
    localStorage = new LocalStorage(LOCAL_STORAGE_PATH);
    localState = new LocalState(localStorage);

    const defaultConfig = {
      columns: ["Name", "State", "Time", "Artist", "Genre"],
      rowsPerPage: 25,
      lastIdp: "",
      theme: "light",
      volume: 1.0,
    };

    assert.strictEqual(localStorage.length, 1);
    assert.strictEqual(localStorage.key(0), CONFIG_KEY);
    assert.deepEqual(
      JSON.parse(localStorage.getItem(CONFIG_KEY) ?? ""),
      defaultConfig,
    );

    const localStateKeys = await localState.keys();
    assert.lengthOf(localStateKeys, 5);
    let actualColumns = await localState.getItem("columns");
    assert.deepEqual(actualColumns, defaultConfig.columns);
    let actualRowsPerPage = await localState.getItem("rowsPerPage");
    assert.strictEqual(actualRowsPerPage, defaultConfig.rowsPerPage);
    let actualLastIdp = await localState.getItem("lastIdp");
    assert.strictEqual(actualLastIdp, defaultConfig.lastIdp);
    let actualTheme = await localState.getItem("theme");
    assert.strictEqual(actualTheme, defaultConfig.theme);
    let actualVolume = await localState.getItem("volume");
    assert.strictEqual(actualVolume, defaultConfig.volume);

    const newColumns = ["Name", "State", "Time"];
    await localState.setItem("columns", newColumns);

    const newRowsPerPage = 5;
    await localState.setItem("rowsPerPage", newRowsPerPage);

    const newLastIdp = "updatedIdp";
    await localState.setItem("lastIdp", newLastIdp);

    const newTheme = "dark";
    await localState.setItem("theme", newTheme);

    const newVolume = 0.5;
    await localState.setItem("volume", newVolume);

    actualColumns = await localState.getItem("columns");
    assert.deepEqual(actualColumns, newColumns);
    actualRowsPerPage = await localState.getItem("rowsPerPage");
    assert.strictEqual(actualRowsPerPage, newRowsPerPage);
    actualLastIdp = await localState.getItem("lastIdp");
    assert.strictEqual(actualLastIdp, newLastIdp);
    actualTheme = await localState.getItem("theme");
    assert.strictEqual(actualTheme, newTheme);
    actualVolume = await localState.getItem("volume");
    assert.strictEqual(actualVolume, newVolume);
    deleteLocation(localStorage);
  });
});
