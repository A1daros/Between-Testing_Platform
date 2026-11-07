import styles from './TestForm.module.scss';
import type {
  NewTestPayload,
  TestFormData,
} from '../../../../../types/testForm';
import { getLevels } from '../../../../../services/levels';
import { useAsyncData } from '../../../../../hooks/useAsyncData';
import { Alert } from '../../../../shared/components/Alert';
import { PartCard } from '../PartCard';
import { QuestionCard } from '../QuestionCard';
import { TimerSection } from '../TimerSection';
import { useTestForm } from './useTestForm';

type TestFormProps = {
  initialData?: TestFormData;
  onSubmit: (payload: NewTestPayload) => Promise<void>;
};

export const TestForm = ({ initialData, onSubmit }: TestFormProps) => {
  const { data: levels, error: levelsError } = useAsyncData(getLevels);

  const {
    form,
    isSubmitting,
    errorMessage,
    updateFields,
    toggleTimer,
    setTimerType,
    setTimerDuration,
    addPart,
    updatePart,
    selectPartAudio,
    removePart,
    addQuestion,
    updateQuestionFields,
    updateAnswerText,
    selectCorrectAnswer,
    removeQuestion,
    handleSubmit,
  } = useTestForm(initialData, onSubmit);

  const visibleError =
    errorMessage || (levelsError ? 'Не вдалося завантажити рівні.' : '');

  return (
    <div className={styles.formContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <div className={styles.fieldGroup}>
            <label htmlFor='testTitle' className={styles.label}>
              Назва тесту *
            </label>
            <input
              id='testTitle'
              type='text'
              className={styles.input}
              placeholder='Напр., Final test A2'
              value={form.title}
              onChange={(event) => updateFields({ title: event.target.value })}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor='testDescription' className={styles.label}>
              Опис тесту *
            </label>
            <textarea
              id='testDescription'
              className={styles.textarea}
              placeholder='Короткий опис для учнів'
              value={form.description}
              onChange={(event) =>
                updateFields({ description: event.target.value })
              }
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor='levelCode' className={styles.label}>
              Рівень *
            </label>
            <select
              id='levelCode'
              className={styles.select}
              value={form.levelId}
              onChange={(event) => updateFields({ levelId: event.target.value })}
              required
            >
              <option value=''>Оберіть рівень...</option>
              {(levels ?? []).map((level) => (
                <option key={level.id} value={level.id}>
                  {level.code} - {level.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Частини тесту</h2>

          <div className={styles.dynamicList}>
            {form.parts.map((part) => (
              <PartCard
                key={part.uiId}
                part={part}
                onChange={(fields) => updatePart(part.uiId, fields)}
                onSelectAudio={(file) => selectPartAudio(part.uiId, file)}
                onRemove={() => removePart(part.uiId)}
              />
            ))}
          </div>

          <button type='button' className={styles.addButton} onClick={addPart}>
            + Додати частину
          </button>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Питання</h2>

          <div className={styles.dynamicList}>
            {form.questions.map((question) => (
              <QuestionCard
                key={question.uiId}
                question={question}
                parts={form.parts}
                onChange={(fields) => updateQuestionFields(question.uiId, fields)}
                onAnswerTextChange={(index, text) =>
                  updateAnswerText(question.uiId, index, text)
                }
                onSelectCorrectAnswer={(index) =>
                  selectCorrectAnswer(question.uiId, index)
                }
                onRemove={() => removeQuestion(question.uiId)}
              />
            ))}
          </div>

          <button
            type='button'
            className={styles.addButton}
            onClick={addQuestion}
          >
            + Додати питання
          </button>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Таймер</h2>

          <TimerSection
            timerEnabled={form.timerEnabled}
            timerType={form.timerType}
            timerDuration={form.timerDuration}
            onToggle={toggleTimer}
            onTypeChange={setTimerType}
            onDurationChange={setTimerDuration}
          />
        </div>

        {visibleError && <Alert>{visibleError}</Alert>}

        <div className={styles.buttons}>
          <button
            disabled={isSubmitting}
            type='submit'
            className={styles.submitButton}
          >
            {isSubmitting ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </form>
    </div>
  );
};
