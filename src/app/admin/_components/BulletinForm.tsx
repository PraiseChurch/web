"use client";

import React, { useState, useTransition } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Bulletin,
  BulletinConfig,
  ResolvedBulletin,
} from "@/app/(site)/bulletin/types";
import { BulletinSchemaV1 } from "@/app/(site)/bulletin/_data/schemas";
import { resolveBulletin } from "@/app/(site)/bulletin/_data/resolve";
import { BulletinPreview } from "./BulletinPreview";
import {
  upsertBulletin,
  publishBulletin,
  unpublishBulletin,
  reSnapshotConfig,
  deleteBulletin,
} from "../_actions/bulletins";

type Props = {
  initialBulletin: Bulletin;
  config: BulletinConfig;
  isPublished: boolean;
  isNew: boolean;
};

export const BulletinForm: React.FC<Props> = ({
  initialBulletin,
  config,
  isPublished,
  isNew,
}) => {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Bulletin>({
    resolver: zodResolver(BulletinSchemaV1),
    defaultValues: initialBulletin,
  });

  const { control, register, handleSubmit, watch, formState } = form;
  const {
    fields: eventFields,
    append: appendEvent,
    remove: removeEvent,
  } = useFieldArray({ control, name: "upcomingEvents" });

  const liveValues = watch();
  let resolved: ResolvedBulletin | null = null;
  try {
    resolved = resolveBulletin(liveValues, config);
  } catch {
    resolved = resolveBulletin(initialBulletin, config);
  }

  const onSave: SubmitHandler<Bulletin> = (values) => {
    setError(null);
    startTransition(async () => {
      try {
        await upsertBulletin(values.date, values);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const onPublish = () => {
    setError(null);
    startTransition(async () => {
      try {
        await publishBulletin(initialBulletin.date);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const onUnpublish = () => {
    setError(null);
    startTransition(async () => {
      try {
        await unpublishBulletin(initialBulletin.date);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const onResnapshot = () => {
    setError(null);
    startTransition(async () => {
      try {
        await reSnapshotConfig(initialBulletin.date);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const onDelete = () => {
    if (
      !confirm(
        isPublished
          ? "Delete this published bulletin? Its public URL will 404."
          : "Delete this draft?",
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteBulletin(initialBulletin.date);
        window.location.href = "/admin/bulletins";
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <div className="grid lg:grid-cols-[3fr_7fr] gap-0 h-[calc(100vh-3.5rem)]">
      <form
        onSubmit={handleSubmit(onSave)}
        className="overflow-y-auto p-6 bg-white border-r border-gray-200 space-y-6"
      >
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-serif font-bold">
            {isNew ? "New bulletin" : `Bulletin ${initialBulletin.date}`}
          </h1>
          <span className="text-xs font-sans uppercase tracking-widest">
            {isPublished ? "Published" : "Draft"}
            {formState.isDirty && (
              <span className="ml-2 text-orange-600">· Unsaved</span>
            )}
          </span>
        </header>

        <fieldset className="space-y-3">
          <label className="block text-sm font-sans font-bold">Date</label>
          <input
            type="date"
            {...register("date")}
            disabled={!isNew}
            className="w-full border border-gray-300 rounded px-3 py-2 disabled:bg-gray-100"
          />
          {formState.errors.date && (
            <p className="text-sm text-red-600">
              {formState.errors.date.message}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-sans font-bold uppercase tracking-widest">
            Sermon
          </legend>
          <input
            placeholder="Title"
            {...register("sermon.title")}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <input
            placeholder="Scripture reference (e.g. 3 John 1:9-11)"
            {...register("sermon.scriptureReference")}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <textarea
            placeholder="Scripture passage with {N} verse markers"
            rows={8}
            {...register("sermon.scripturePassage")}
            className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm"
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-sans font-bold uppercase tracking-widest">
            Worship step overrides
          </legend>
          <p className="text-xs text-gray-600 font-sans">
            Leave blank to use the config default.
          </p>
          {config.worshipSteps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              <span className="text-xs font-sans w-32 text-gray-600">
                {step.title}
              </span>
              <input
                placeholder={step.defaultAssignment}
                {...register(`assignmentOverrides.${step.id}`)}
                className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
          ))}
        </fieldset>

        <fieldset>
          <label className="flex items-center gap-2 text-sm font-sans">
            <input type="checkbox" {...register("isCommunion")} />
            Communion Sunday (highlight Lord&apos;s Supper step)
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-sans font-bold uppercase tracking-widest">
            Discovery
          </legend>
          <input
            placeholder="Men's group location"
            {...register("discovery.mens")}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <input
            placeholder="Women's group location"
            {...register("discovery.womens")}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </fieldset>

        <fieldset className="space-y-3">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-sans font-bold uppercase tracking-widest">
              Upcoming events
            </legend>
            <button
              type="button"
              onClick={() =>
                appendEvent({
                  category: config.enums.eventCategory[0] ?? "GENERAL",
                  date: "",
                  title: "",
                })
              }
              className="text-xs font-sans underline"
            >
              + Add event
            </button>
          </div>
          {eventFields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2">
              <Controller
                control={control}
                name={`upcomingEvents.${idx}.category`}
                render={({ field: f }) => (
                  <select
                    {...f}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                  >
                    {config.enums.eventCategory.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              />
              <input
                type="date"
                {...register(`upcomingEvents.${idx}.date`)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <input
                placeholder="Title"
                {...register(`upcomingEvents.${idx}.title`)}
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => removeEvent(idx)}
                className="text-sm text-red-600"
                aria-label="Remove event"
              >
                ✕
              </button>
            </div>
          ))}
        </fieldset>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 sticky bottom-0 bg-white pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-black text-white rounded text-sm font-sans font-bold disabled:opacity-50"
          >
            Save
          </button>
          {!isPublished && !isNew && (
            <button
              type="button"
              onClick={onPublish}
              disabled={pending || formState.isDirty}
              title={formState.isDirty ? "Save first" : ""}
              className="px-4 py-2 bg-slide-orange text-white rounded text-sm font-sans font-bold disabled:opacity-50"
            >
              Publish
            </button>
          )}
          {isPublished && (
            <>
              <button
                type="button"
                onClick={onUnpublish}
                disabled={pending}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-sans font-bold disabled:opacity-50"
              >
                Unpublish
              </button>
              <button
                type="button"
                onClick={onResnapshot}
                disabled={pending}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-sans disabled:opacity-50"
              >
                Re-snapshot config
              </button>
            </>
          )}
          {!isNew && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="ml-auto px-4 py-2 text-sm font-sans text-red-600 disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </form>
      <div className="hidden lg:block">
        {resolved && <BulletinPreview resolved={resolved} />}
      </div>
    </div>
  );
};
