import { Building2, Plus, Trash2 } from 'lucide-react';
import type { LbPropertyInfo } from '../lib/types';
import {
  getPropertyCategory,
  propertyCategoryLabel,
  PROPERTY_CATEGORY_UI,
} from '../lib/propertyInfoConfig';
import { Btn } from './Btn';
import { FormInput } from './FormInput';
import { Label } from './Label';
import { SectionDivider } from './SectionDivider';

type Props = {
  propertyType: string;
  form: LbPropertyInfo;
  setForm: React.Dispatch<React.SetStateAction<LbPropertyInfo>>;
  scopeInput: string;
  setScopeInput: (v: string) => void;
  showNotes?: boolean;
};

export function PropertyInfoFormFields({
  propertyType,
  form,
  setForm,
  scopeInput,
  setScopeInput,
  showNotes = true,
}: Props) {
  const category = getPropertyCategory(propertyType);
  const ui = PROPERTY_CATEGORY_UI[category];

  const addScope = () => {
    const value = scopeInput.trim();
    if (!value) return;
    setForm((f) => ({
      ...f,
      scopeIncluded: [...(f.scopeIncluded ?? []), value],
    }));
    setScopeInput('');
  };

  const removeScope = (idx: number) => {
    setForm((f) => ({
      ...f,
      scopeIncluded: (f.scopeIncluded ?? []).filter((_, i) => i !== idx),
    }));
  };

  const addSpec = () => {
    setForm((f) => ({
      ...f,
      specifications: [...(f.specifications ?? []), { label: '', value: '' }],
    }));
  };

  const updateSpec = (idx: number, field: 'label' | 'value', value: string) => {
    setForm((f) => ({
      ...f,
      specifications: (f.specifications ?? []).map((s, i) =>
        i === idx ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const removeSpec = (idx: number) => {
    setForm((f) => ({
      ...f,
      specifications: (f.specifications ?? []).filter((_, i) => i !== idx),
    }));
  };

  const locationFields = (
    ['flatNumber', 'tower', 'floor', 'facing'] as const
  ).filter((k) => ui.fields[k].show);

  const areaFields = (
    ['superBuiltUpSqft', 'totalAreaSqft', 'carpetAreaSqft', 'balconySqft'] as const
  ).filter((k) => ui.fields[k].show);

  return (
    <>
      <div
        style={{
          fontSize: 11,
          color: 'var(--lb-mu)',
          marginBottom: 12,
          padding: '8px 12px',
          background: 'var(--lb-off)',
          borderRadius: 8,
          border: '1px solid var(--lb-bd)',
        }}
      >
        Property type: <strong>{propertyType}</strong> · Form:{' '}
        <strong>{propertyCategoryLabel(category)}</strong>
      </div>

      <div className="lb-card lb-fa">
        <SectionDivider
          title={ui.locationTitle}
          hint="Shown on customer Property Info page"
          icon={<Building2 size={13} strokeWidth={1.8} color="var(--lb-blue)" />}
        />
        {locationFields.length > 0 ? (
          <div
            className="lb-form-row"
            style={{
              marginBottom: 12,
              display: 'grid',
              gridTemplateColumns: locationFields.length > 2 ? '1fr 1fr' : '1fr',
              gap: 12,
            }}
          >
            {locationFields.map((key) => (
              <div key={key}>
                <Label>{ui.fields[key].label}</Label>
                <FormInput
                  placeholder={ui.fields[key].placeholder}
                  value={(form[key] as string | undefined) ?? ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {areaFields.length > 0 ? (
        <div className="lb-card lb-fa" style={{ marginTop: 14 }}>
          <SectionDivider title={ui.areasTitle} />
          <div
            className="lb-g3"
            style={{
              marginBottom: 12,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
            }}
          >
            {areaFields.map((key) => (
              <div key={key}>
                <Label>{ui.fields[key].label}</Label>
                <FormInput
                  type="number"
                  value={form[key] ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="lb-card lb-fa" style={{ marginTop: 14 }}>
        <SectionDivider title={ui.scopeTitle} />
        <div style={{ marginBottom: 12 }}>
          <Label>{ui.designScopeLabel}</Label>
          <FormInput
            as="textarea"
            rows={3}
            value={form.designScope ?? ''}
            onChange={(e) => setForm({ ...form, designScope: e.target.value })}
            placeholder={ui.designScopePlaceholder}
          />
        </div>
        {ui.showScopeList ? (
          <div style={{ marginBottom: 12 }}>
            <Label>Scope included (bullet list)</Label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <FormInput
                value={scopeInput}
                onChange={(e) => setScopeInput(e.target.value)}
                placeholder="Add scope item"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addScope();
                  }
                }}
              />
              <Btn variant="ghost" size="sm" onClick={addScope}>
                <Plus size={12} />
                Add
              </Btn>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(form.scopeIncluded ?? []).map((item, idx) => (
                <div key={idx} className="lb-card-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, fontSize: 13 }}>{item}</span>
                  <Btn variant="icon" size="xs" aria-label="Remove" onClick={() => removeScope(idx)}>
                    <Trash2 size={12} color="var(--lb-rd)" />
                  </Btn>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Label>
              Specifications
              {ui.specHints.length ? (
                <span style={{ fontWeight: 400, color: 'var(--lb-mu)', marginLeft: 6 }}>
                  e.g. {ui.specHints.join(', ')}
                </span>
              ) : null}
            </Label>
            <Btn variant="ghost" size="sm" onClick={addSpec}>
              <Plus size={12} />
              Add row
            </Btn>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(form.specifications ?? []).map((spec, idx) => (
              <div key={idx} className="lb-form-row">
                <FormInput
                  placeholder="Label"
                  value={spec.label}
                  onChange={(e) => updateSpec(idx, 'label', e.target.value)}
                />
                <FormInput
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                />
                <Btn variant="icon" size="xs" aria-label="Remove" onClick={() => removeSpec(idx)}>
                  <Trash2 size={12} color="var(--lb-rd)" />
                </Btn>
              </div>
            ))}
          </div>
        </div>
        {showNotes ? (
          <div style={{ marginTop: 12 }}>
            <Label>Internal notes</Label>
            <FormInput
              as="textarea"
              rows={2}
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
