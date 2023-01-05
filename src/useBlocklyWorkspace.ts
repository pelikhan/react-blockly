import React from "react";
import Blockly, {Workspace, WorkspaceSvg} from "blockly";
import {UseBlocklyProps, BlocklyWorkspaceState} from "./BlocklyWorkspaceProps";

import debounce from "./debounce";

function importFromJSON(json: BlocklyWorkspaceState, workspace: Workspace, onImportJSONError: (error: any) => void) {
  try {
    Blockly.serialization.workspaces.load(json, workspace)
    return true;
  } catch (e) {
    if (onImportJSONError) {
      onImportJSONError(e);
    }
    return false;
  }
}

const useBlocklyWorkspace = ({
  ref,
  initialJSON,
  toolboxConfiguration,
  workspaceConfiguration,
  onWorkspaceChange,
  onImportJSONError,
  onInject,
  onDispose,
}: UseBlocklyProps): {workspace: WorkspaceSvg|null, json: BlocklyWorkspaceState|null} => {
  const [workspace, setWorkspace] = React.useState<WorkspaceSvg|null>(null);
  const [json, setJSON] = React.useState<object|null>(initialJSON);
  const [didInitialImport, setDidInitialImport] = React.useState(false);
  const [didHandleNewWorkspace, setDidHandleNewWorkspace] =
    React.useState(false);

  // we explicitly don't want to recreate the workspace when the configuration changes
  // so, we'll keep it in a ref and update as necessary in an effect hook
  const workspaceConfigurationRef = React.useRef(workspaceConfiguration);
  React.useEffect(() => {
    workspaceConfigurationRef.current = workspaceConfiguration;
  }, [workspaceConfiguration]);

  const toolboxConfigurationRef = React.useRef(toolboxConfiguration);
  React.useEffect(() => {
    toolboxConfigurationRef.current = toolboxConfiguration;
    if (toolboxConfiguration && workspace) {
      workspace.updateToolbox(toolboxConfiguration);
    }
  }, [toolboxConfiguration, workspace]);

  const onInjectRef = React.useRef(onInject);
  const onDisposeRef = React.useRef(onDispose);
  React.useEffect(() => {
    onInjectRef.current = onInject;
  }, [onInject]);
  React.useEffect(() => {
    onDisposeRef.current = onDispose;
  }, [onDispose]);

  const handleWorkspaceChanged = React.useCallback(
    (newWorkspace: WorkspaceSvg) => {
      if (onWorkspaceChange) {
        onWorkspaceChange(newWorkspace);
      }
    },
    [onWorkspaceChange]
  );

  // Workspace creation
  React.useEffect(() => {
    if (!ref.current){
      return;
    }
    const newWorkspace = Blockly.inject(ref.current, {
      ...workspaceConfigurationRef.current,
      toolbox: toolboxConfigurationRef.current,
    });
    setWorkspace(newWorkspace);
    setDidInitialImport(false); // force a re-import if we recreate the workspace
    setDidHandleNewWorkspace(false); // Signal that a workspace change event needs to be sent.

    if (onInjectRef.current) {
      onInjectRef.current(newWorkspace);
    }

    const onDisposeFunction = onDisposeRef.current;

    // Dispose of the workspace when our div ref goes away (Equivalent to didComponentUnmount)
    return () => {
      newWorkspace.dispose();

      if (onDisposeFunction) {
        onDisposeFunction(newWorkspace);
      }
    };
  }, [ref]);

  // Send a workspace change event when the workspace is created
  React.useEffect(() => {
    if (workspace && !didHandleNewWorkspace) {
      handleWorkspaceChanged(workspace);
    }
  }, [handleWorkspaceChanged, didHandleNewWorkspace, workspace]);

  // Workspace change listener
  React.useEffect(() => {
    if (workspace == null) {
      return undefined;
    }

    const listener = () => {
      handleWorkspaceChanged(workspace);
    };
    workspace.addChangeListener(listener);
    return () => {
      workspace.removeChangeListener(listener);
    };
  }, [workspace, handleWorkspaceChanged]);

  // xmlDidChange callback
  React.useEffect(() => {
    if (workspace == null) {
      return undefined;
    }

    const [callback, cancel] = debounce(() => {
      const newJSON = Blockly.serialization.workspaces.save(workspace)
      if (JSON.stringify(newJSON) === JSON.stringify(json)) {
        return;
      }

      setJSON(json);
    }, 200);

    workspace.addChangeListener(callback);

    return () => {
      workspace.removeChangeListener(callback);
      cancel();
    };
  }, [workspace, json]);

  // Initial Xml Changes
  React.useEffect(() => {
    if (json && workspace && !didInitialImport) {
      const success = importFromJSON(json, workspace, onImportJSONError);
      if (!success) {
        setJSON(null);
      }
      setDidInitialImport(true);
    }
  }, [json, workspace, didInitialImport, onImportJSONError]);

  return { workspace, json };
};

export default useBlocklyWorkspace;
