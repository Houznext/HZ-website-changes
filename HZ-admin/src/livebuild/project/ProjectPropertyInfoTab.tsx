import { useCallback, useEffect, useState } from 'react';
import livebuildApi from '../lib/api';
import type { LbPropertyInfo } from '../lib/types';
import { buildPropertyInfoPayload, emptyPropertyInfo } from '../lib/propertyInfoConfig';
import { Btn, lbToast } from '../components';
import { PropertyInfoFormFields } from '../components/PropertyInfoFormFields';
import Loader from '@/src/common/Loader';

type Props = {
  projectId: string;
  projectName: string;
  propertyType: string;
};

export function ProjectPropertyInfoTab({ projectId, projectName, propertyType }: Props) {
  const [form, setForm] = useState<LbPropertyInfo>(emptyPropertyInfo());
  const [scopeInput, setScopeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const info = await livebuildApi.getPropertyInfo(projectId);
      setForm(
        info
          ? {
              ...info,
              scopeIncluded: info.scopeIncluded ?? [],
              specifications: info.specifications ?? [],
            }
          : emptyPropertyInfo(),
      );
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load property info', 'err');
      setForm(emptyPropertyInfo());
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await livebuildApi.upsertPropertyInfo(projectId, buildPropertyInfoPayload(form));
      lbToast('Property info saved', 'ok');
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Save failed', 'err');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="lb-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ fontFamily: 'var(--lb-m)', fontSize: 14, fontWeight: 700 }}>
          Property Info — {projectName}
        </div>
        <Btn variant="blue" size="sm" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save property info'}
        </Btn>
      </div>

      <PropertyInfoFormFields
        propertyType={propertyType}
        form={form}
        setForm={setForm}
        scopeInput={scopeInput}
        setScopeInput={setScopeInput}
      />
    </div>
  );
}
