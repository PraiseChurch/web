"use client";

import React, { useState, useTransition } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { BulletinConfig } from "@/app/(site)/bulletin/types";
import { BulletinConfigSchemaV1 } from "@/app/(site)/bulletin/_data/schemas";
import { updateConfig } from "../_actions/config";
import { EnumListEditor } from "./EnumListEditor";

type Props = { initialConfig: BulletinConfig };

export const ConfigForm: React.FC<Props> = ({ initialConfig }) => {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const form = useForm<BulletinConfig>({
    resolver: zodResolver(BulletinConfigSchemaV1),
    defaultValues: initialConfig,
  });
  const { control, register, handleSubmit, formState } = form;

  const stepFields = useFieldArray({ control, name: "worshipSteps" });
  const midweekFields = useFieldArray({ control, name: "midweekMinistries" });

  const onSubmit: SubmitHandler<BulletinConfig> = (values) => {
    setError(null);
    startTransition(async () => {
      try {
        await updateConfig(values);
        setSavedAt(new Date().toLocaleTimeString());
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-serif font-bold mb-6">Site config</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <fieldset className="space-y-3">
          <legend className="text-sm font-sans font-bold uppercase tracking-widest">
            Church
          </legend>
          <input
            {...register("church.name")}
            placeholder="Church name"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <input
            {...register("church.address")}
            placeholder="Address"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <input
            {...register("church.welcomeLine")}
            placeholder="Welcome line"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </fieldset>

        <fieldset>
          <legend className="text-sm font-sans font-bold uppercase tracking-widest mb-2">
            Mission statement
          </legend>
          <textarea
            {...register("missionStatement")}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-sans font-bold uppercase tracking-widest">
            Worship steps
          </legend>
          {stepFields.fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-3 gap-2">
              <input
                {...register(`worshipSteps.${idx}.id`)}
                placeholder="id"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm font-mono"
              />
              <input
                {...register(`worshipSteps.${idx}.title`)}
                placeholder="title"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <input
                {...register(`worshipSteps.${idx}.defaultAssignment`)}
                placeholder="default assignment"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
          ))}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-sans font-bold uppercase tracking-widest">
            Midweek ministries
          </legend>
          {midweekFields.fields.map((dayField, dIdx) => (
            <MidweekDayEditor
              key={dayField.id}
              dIdx={dIdx}
              control={control}
              register={register}
            />
          ))}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-sans font-bold uppercase tracking-widest mb-3">
            Enums
          </legend>
          <Controller
            control={control}
            name="enums.eventCategory"
            render={({ field }) => (
              <EnumListEditor
                label="Event category"
                values={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </fieldset>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        {savedAt && (
          <p className="text-sm text-green-700">Saved at {savedAt}</p>
        )}

        <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={pending || !formState.isDirty}
            className="px-4 py-2 bg-black text-white rounded text-sm font-sans font-bold disabled:opacity-50"
          >
            Save config
          </button>
        </div>
      </form>
    </main>
  );
};

const MidweekDayEditor: React.FC<{
  dIdx: number;
  control: any;
  register: any;
}> = ({ dIdx, control, register }) => {
  const meetingsField = useFieldArray({
    control,
    name: `midweekMinistries.${dIdx}.meetings`,
  });
  return (
    <div className="border border-gray-200 rounded p-3 space-y-2">
      <input
        {...register(`midweekMinistries.${dIdx}.day`)}
        placeholder="Day (e.g. Wednesday)"
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      />
      {meetingsField.fields.map((m, mIdx) => (
        <div key={m.id} className="grid grid-cols-3 gap-2">
          <input
            {...register(`midweekMinistries.${dIdx}.meetings.${mIdx}.name`)}
            placeholder="Meeting name"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <input
            {...register(`midweekMinistries.${dIdx}.meetings.${mIdx}.location`)}
            placeholder="Location"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <input
            {...register(`midweekMinistries.${dIdx}.meetings.${mIdx}.time`)}
            placeholder="Time"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          meetingsField.append({ name: "", location: "", time: "" })
        }
        className="text-xs underline"
      >
        + Add meeting
      </button>
    </div>
  );
};
