import React, { useEffect, useState, type FormEvent } from 'react';
import type { Level } from '../../../../../../../types/database';
import { useNavigate } from 'react-router-dom';
import type { NewTestPayload, UIPart, UIQuestion } from '../../types/testForm';
import styles from './TestForm.module.scss';
import { getLevelsById } from '../../../../../../../services/levels';

type Props = {
  initialData?: {
    title: string;
    description: string;
    levelId: string;
    timerEnabled: boolean;
    timerType: 'test' | 'question' | null;
    timerDuration: number | null;
    parts: UIPart[];
    questions: UIQuestion[];
  };
  onSubmit: (payload: NewTestPayload) => Promise<void>;
};

export const TestForm: React.FC<Props> = ({ initialData, onSubmit }) => {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? '',
  );
  const [levelId, setLevelId] = useState(initialData?.levelId ?? '');
  const [timerEnabled, setTimerEnabled] = useState(
    initialData?.timerEnabled ?? false,
  );
  const [timerType, setTimerType] = useState<'test' | 'question' | null>(
    initialData?.timerType ?? null,
  );
  const [timerDuration, setTimerDuration] = useState<number | null>(
    initialData?.timerDuration ?? null,
  );

  const [parts, setParts] = useState<UIPart[]>(initialData?.parts ?? []);
  const [questions, setQuestions] = useState<UIQuestion[]>(
    initialData?.questions ?? [],
  );

  const [levels, setLevels] = useState<Level[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const data = await getLevelsById();

        setLevels(data);
      } catch (error) {
        console.error('Failed to load level data', error);
      }
    };

    loadLevels();
  }, []);

  const handleAddPart = () => {
    const newPart: UIPart = {
      uiId: crypto.randomUUID(),
      title: '',
      instruction: '',
      points: 1,
    };

    setParts([...parts, newPart]);
  };

  const handleUpdatePart = (
    uiId: string,
    fields: Partial<Omit<UIPart, 'uiId'>>,
  ) => {
    setParts(
      parts.map((part) => (part.uiId === uiId ? { ...part, ...fields } : part)),
    );
  };

  const handleRemovePart = (uiId: string) => {
    setParts(parts.filter((part) => part.uiId !== uiId));

    setQuestions(
      questions.map((question) =>
        question.partUiId === uiId
          ? {
              ...question,
              partUiId: null,
            }
          : question,
      ),
    );
  };

  const handleAddQuestion = () => {
    const newQuestion: UIQuestion = {
      uiId: crypto.randomUUID(),
      partUiId: null,
      question: '',
      answers: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    };

    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestionPart = (uiId: string, partUiId: string) => {
    setQuestions(
      questions.map((question) =>
        question.uiId === uiId
          ? { ...question, partUiId: partUiId || null }
          : question,
      ),
    );
  };

  const handleUpdateQuestionText = (uiId: string, text: string) => {
    setQuestions(
      questions.map((question) =>
        question.uiId === uiId ? { ...question, question: text } : question,
      ),
    );
  };

  const handleUpdateAnswerText = (
    questionUiId: string,
    answerIndex: number,
    text: string,
  ) => {
    setQuestions(
      questions.map((question) => {
        if (question.uiId !== questionUiId) {
          return question;
        }

        const updatedAnswers = question.answers.map((answer, index) =>
          index === answerIndex ? { ...answer, text } : answer,
        );

        return { ...question, answers: updatedAnswers };
      }),
    );
  };

  const handleSelectCorrectAnswer = (
    questionUiId: string,
    correctIndex: number,
  ) => {
    setQuestions(
      questions.map((question) => {
        if (question.uiId !== questionUiId) {
          return question;
        }

        const updatedAnswers = question.answers.map((answer, index) => ({
          ...answer,
          isCorrect: index === correctIndex,
        }));

        return { ...question, answers: updatedAnswers };
      }),
    );
  };

  const handleRemoveQuestion = (uiId: string) => {
    setQuestions(questions.filter((question) => question.uiId !== uiId));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const payload: NewTestPayload = {
      title,
      description,
      levelId,
      timerEnabled,
      timerType,
      timerDuration,
      parts: parts.map(({ uiId, title, instruction, points }) => ({
        uiId,
        title,
        instruction,
        points,
      })),
      questions: questions.map(({ partUiId, question, answers }) => {
        return {
          partId: partUiId,
          question,
          answers,
        };
      }),
    };

    try {
      await onSubmit(payload);

      navigate('/admin/tests');
    } catch (error) {
      console.error('Failed to create test:', error);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <div className={styles.fieldGroup}>
            <label htmlFor='testTitle' className={styles.label}>
              Test title *
            </label>
            <input
              id='testTitle'
              type='text'
              className={styles.input}
              placeholder='e.g. English Placement Test'
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor='testDescription' className={styles.label}>
              Test description *
            </label>
            <textarea
              id='testDescription'
              className={styles.textarea}
              placeholder='Short description for students'
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor='levelCode' className={styles.label}>
              Select level *
            </label>
            <select
              id='levelCode'
              className={styles.select}
              value={levelId}
              onChange={(event) => setLevelId(event.target.value)}
              required
            >
              <option value=''>Select code...</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.code} - {level.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Test parts</h2>

          <div className={styles.dynamicList}>
            {parts.map((part) => (
              <div key={part.uiId} className={styles.dynamicCard}>
                <button
                  type='button'
                  className={styles.removeButton}
                  onClick={() => handleRemovePart(part.uiId)}
                >
                  ✕
                </button>

                <div className={styles.fieldGroup}>
                  <label
                    htmlFor={`partTitle-${part.uiId}`}
                    className={styles.label}
                  >
                    Part title
                  </label>
                  <input
                    id={`partTitle-${part.uiId}`}
                    className={styles.input}
                    value={part.title}
                    onChange={(event) =>
                      handleUpdatePart(part.uiId, { title: event.target.value })
                    }
                    placeholder='e.g. Reading | Writing | Listening'
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label
                    htmlFor={`instruction-${part.uiId}`}
                    className={styles.label}
                  >
                    Instruction
                  </label>
                  <textarea
                    id={`instruction-${part.uiId}`}
                    className={styles.textarea}
                    value={part.instruction}
                    onChange={(event) =>
                      handleUpdatePart(part.uiId, {
                        instruction: event.target.value,
                      })
                    }
                    placeholder='Instruction text for this part'
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label
                    htmlFor={`points-${part.uiId}`}
                    className={styles.label}
                  >
                    Points
                  </label>
                  <input
                    id={`points-${part.uiId}`}
                    className={styles.input}
                    type='number'
                    value={part.points}
                    onChange={(event) =>
                      handleUpdatePart(part.uiId, {
                        points: Number(event.target.value),
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type='button'
            className={styles.addButton}
            onClick={handleAddPart}
          >
            + Add test part
          </button>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Questions</h2>

          <div className={styles.dynamicList}>
            {questions.map((question) => (
              <div key={question.uiId} className={styles.dynamicCard}>
                <button
                  type='button'
                  className={styles.removeButton}
                  onClick={() => handleRemoveQuestion(question.uiId)}
                >
                  ✕
                </button>

                <div className={styles.fieldGroup}>
                  <label
                    htmlFor={`questionPart-${question.uiId}`}
                    className={styles.label}
                  >
                    Part
                  </label>
                  <select
                    id={`questionPart-${question.uiId}`}
                    className={styles.select}
                    value={question.partUiId ?? ''}
                    onChange={(event) =>
                      handleUpdateQuestionPart(
                        question.uiId,
                        event.target.value,
                      )
                    }
                  >
                    <option value=''>No part</option>
                    {parts.map((part) => (
                      <option key={part.uiId} value={part.uiId}>
                        {part.title || 'Untitled part'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label
                    htmlFor={`questionText-${question.uiId}`}
                    className={styles.label}
                  >
                    Question text
                  </label>
                  <input
                    id={`questionText-${question.uiId}`}
                    className={styles.input}
                    value={question.question}
                    onChange={(event) =>
                      handleUpdateQuestionText(
                        question.uiId,
                        event.target.value,
                      )
                    }
                    type='text'
                    placeholder='Question text'
                  />
                </div>

                <h4 className={styles.subTitle}>Answers</h4>

                <div className={styles.answersList}>
                  {question.answers.map((answer, index) => (
                    <div key={index}>
                      <input
                        type='radio'
                        className={styles.radio}
                        name={`correct-answer-${question.uiId}`}
                        checked={answer.isCorrect}
                        onChange={() =>
                          handleSelectCorrectAnswer(question.uiId, index)
                        }
                      />
                      <input
                        type='text'
                        className={styles.input}
                        value={answer.text}
                        onChange={(event) =>
                          handleUpdateAnswerText(
                            question.uiId,
                            index,
                            event.target.value,
                          )
                        }
                        placeholder={`Answer ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type='button'
            className={styles.addButton}
            onClick={handleAddQuestion}
          >
            + Add question
          </button>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Timer</h2>

          <div className={styles.checkboxGroup}>
            <input
              id='timerEnabled'
              type='checkbox'
              className={styles.checkbox}
              checked={timerEnabled}
              onChange={(event) => {
                const enabled = event.target.checked;
                setTimerEnabled(enabled);
                if (!enabled) {
                  setTimerType(null);
                  setTimerDuration(null);
                }
              }}
            />
            <label htmlFor='timerEnabled' className={styles.label}>
              Enable timer
            </label>
          </div>

          {timerEnabled && (
            <div className={styles.timerFields}>
              <div className={styles.fieldGroup}>
                <label htmlFor='timerType' className={styles.label}>
                  Timer type
                </label>
                <select
                  id='timerType'
                  className={styles.select}
                  value={timerType ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    setTimerType(
                      value === 'test' || value === 'question' ? value : null,
                    );
                  }}
                  required
                >
                  <option value=''>Select timer type...</option>
                  <option value='test'>Whole test</option>
                  <option value='question'>Each question</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor='timerDuration' className={styles.label}>
                  Timer duration (seconds)
                </label>
                <input
                  id='timerDuration'
                  type='number'
                  min='1'
                  className={styles.input}
                  value={timerDuration ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    setTimerDuration(value ? Number(value) : null);
                  }}
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles.buttons}>
          <button type='submit' className={styles.submitButton}>
            Save Test
          </button>
        </div>
      </form>
    </div>
  );
};
