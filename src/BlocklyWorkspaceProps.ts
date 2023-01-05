import Blockly, { WorkspaceSvg } from "blockly";
import { RefObject } from "react";

export type BlocklyWorkspaceState = { [key: string]: any };

export interface CommonBlocklyProps {
    initialJSON: BlocklyWorkspaceState,
    toolboxConfiguration: Blockly.utils.toolbox.ToolboxDefinition,
    workspaceConfiguration: Blockly.BlocklyOptions,
    onWorkspaceChange: (workspace: WorkspaceSvg) => void,
    onImportJSONError: (error: any) => void,
    onInject: (newWorkspace: WorkspaceSvg) => void,
    onDispose: (workspace: WorkspaceSvg) => void
}

export interface BlocklyWorkspaceProps extends CommonBlocklyProps {
    className: string,
    onJSONChange: (json: BlocklyWorkspaceState) => void,
}

export interface UseBlocklyProps extends CommonBlocklyProps {
    ref: RefObject<Element>;
}
