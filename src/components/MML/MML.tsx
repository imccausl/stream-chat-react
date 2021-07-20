import React, { Suspense } from 'react';
import 'mml-react/dist/styles/index.css';

import { useChatContext } from '../../context/ChatContext';

import type { ActionHandlerReturnType } from '../Message/hooks/useActionHandler';

const MMLReact = React.lazy(async () => {
  const mml = await import('mml-react');
  return { default: mml.MML };
});

export type MMLProps = {
  /** MML source string */
  source: string;
  /** Submit handler for mml actions */
  actionHandler?: ActionHandlerReturnType;
  /** Align MML components to left/right, defaults to right */
  align?: 'left' | 'right';
};

/**
 * A wrapper component around MML-React library
 */
export const MML: React.FC<MMLProps> = (props) => {
  const { actionHandler, align = 'right', source } = props;

  const { theme } = useChatContext();

  return (
    <Suspense fallback={null}>
      <MMLReact
        className={`mml-align-${align}`}
        Loading={null}
        onSubmit={actionHandler}
        source={source}
        Success={null}
        theme={(theme || '').replace(' ', '-')}
      />
    </Suspense>
  );
};
