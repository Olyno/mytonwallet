import { FormEvent } from 'react';
import React, {
  memo, useCallback, useEffect, useState,
} from '../../lib/teact/teact';

import { MNEMONIC_CHECK_COUNT } from '../../config';
import buildClassName from '../../util/buildClassName';
import { areSortedArraysEqual } from '../../util/iteratees';

import ModalHeader from '../ui/ModalHeader';
import Button from '../ui/Button';
import InputMnemonic from '../ui/InputMnemonic';

import styles from './Auth.module.scss';
import modalStyles from '../ui/Modal.module.scss';

type OwnProps = {
  isActive?: boolean;
  isInModal?: boolean;
  mnemonic?: string[];
  checkIndexes?: number[];
  buttonLabel: string;
  onSubmit: NoneToVoidFunction;
  onCancel: NoneToVoidFunction;
  onClose: NoneToVoidFunction;
};

function MnemonicCheck({
  isActive, isInModal, mnemonic, checkIndexes, buttonLabel, onCancel, onSubmit, onClose,
}: OwnProps) {
  const [words, setWords] = useState<Record<number, string>>({});
  const [hasMnemonicError, setHasMnemonicError] = useState(false);

  useEffect(() => {
    if (isActive) {
      setWords({});
      setHasMnemonicError(false);
    }
  }, [isActive]);

  const handleSetWord = useCallback((value: string, index: number) => {
    setWords({
      ...words,
      [index]: value?.toLowerCase(),
    });
  }, [words]);

  const handleMnemonicCheckSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const answer = mnemonic && checkIndexes?.map((index) => mnemonic[index]);
    if (answer && areSortedArraysEqual(answer, Object.values(words))) {
      onSubmit();
    } else {
      setHasMnemonicError(true);
    }
  }, [onSubmit, checkIndexes, mnemonic, words]);

  return (
    <div className={modalStyles.transitionContentWrapper}>
      <ModalHeader title="Let's check!" onClose={onClose} />
      <div className={buildClassName(modalStyles.transitionContent, 'custom-scroll')}>
        <p className={buildClassName(styles.info, styles.small)}>
          Let’s make sure your secrets words are recorded correctly.
        </p>

        <p className={buildClassName(styles.info, styles.small)}>
          Please enter the words <strong>{checkIndexes?.map((n) => n + 1)?.join(', ')}</strong> below.
        </p>

        <form onSubmit={handleMnemonicCheckSubmit} id="check_mnemonic_form">
          {checkIndexes!.map((key, i) => (
            <InputMnemonic
              key={key}
              id={`check-mnemonic-${i}`}
              nextId={i + 1 < MNEMONIC_CHECK_COUNT ? `check-mnemonic-${i + 1}` : undefined}
              labelText={`${key + 1}`}
              value={words[key]}
              isInModal={isInModal}
              suggestionsPosition={i > 1 ? 'top' : undefined}
              inputArg={key}
              className={styles.checkMnemonicInput}
              onInput={handleSetWord}
            />
          ))}
        </form>

        {hasMnemonicError && (
          <div className={buildClassName(styles.error, styles.small)}>
            The secret words you have entered do not
            match the ones in the list. Please try again.
          </div>
        )}

        <div className={modalStyles.buttons}>
          <Button onClick={onCancel}>Back</Button>
          <Button isPrimary forFormId="check_mnemonic_form">{buttonLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export default memo(MnemonicCheck);
