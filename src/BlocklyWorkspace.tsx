import React from "react";
import PropTypes from "prop-types";
import useBlocklyWorkspace from "./useBlocklyWorkspace";
import {BlocklyWorkspaceProps} from "./BlocklyWorkspaceProps";

const propTypes = {
  initialJSON: PropTypes.object,
  toolboxConfiguration: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  workspaceConfiguration: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  className: PropTypes.string,
  onWorkspaceChange: PropTypes.func,
  onImportJSONError: PropTypes.func,
  onJSONChange: PropTypes.func,
  onInject: PropTypes.func,
  onDispose: PropTypes.func,
};

const defaultProps = {
  initialJSON: null,
  toolboxConfiguration: null,
  workspaceConfiguration: null,
  className: null,
  onWorkspaceChange: null,
  onImportJSONError: null,
  onJSONChange: null,
  onInject: null,
  onDispose: null,
};

function BlocklyWorkspace({
  initialJSON,
  toolboxConfiguration,
  workspaceConfiguration,
  className,
  onWorkspaceChange,
  onJSONChange,
  onImportJSONError,
  onInject,
  onDispose,
}: BlocklyWorkspaceProps) {
  const editorDiv = React.useRef(null);
  const { json } = useBlocklyWorkspace({
    ref: editorDiv,
    initialJSON,
    toolboxConfiguration,
    workspaceConfiguration,
    onWorkspaceChange,
    onImportJSONError,
    onInject,
    onDispose,
  });
  const onJSONChangeRef = React.useRef(onJSONChange);
  React.useEffect(() => {
    onJSONChangeRef.current = onJSONChange;
  }, [onJSONChange]);
  React.useEffect(() => {
    if (onJSONChangeRef.current && json) {
      onJSONChangeRef.current(json);
    }
  }, [json]);

  return <div className={className} ref={editorDiv} />;
}

BlocklyWorkspace.propTypes = propTypes;
BlocklyWorkspace.defaultProps = defaultProps;

export default BlocklyWorkspace;
